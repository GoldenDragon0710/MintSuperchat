const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { ConversationalRetrievalQAChain } = require("langchain/chains");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { DocxLoader } = require("langchain/document_loaders/fs/docx");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { Document } = require("langchain/document");
const Chatbot = require("../models/Chatbot");
const BlockList = require("../models/Blocklist");
const Dataset = require("../models/Dataset");
const Phone = require("../models/Phone");
const xlsx = require("xlsx");
const xml2js = require("xml2js");
const Papa = require("papaparse");
const fs = require("fs");
const puppeteer = require("puppeteer");
const Sitemapper = require("sitemapper");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const { Client } = require("whatsapp-web.js");
require("dotenv").config();

const sysPrompt = `You are an AI assistant providing helpful answers based on the context to provide a conversational answer without any prior knowledge. You are given the following extracted parts of a long document and a question. If you can't find the answer in the context below, just say, "Thank you for your question. I can not help you on this topic. Please look online using a search engine.". You can also ask the user to rephrase the question if you need more context. But don't try to make up an answer. If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context. Answer in a concise or elaborate format as per the intent of the question. When asked a question, provide thorough and detailed answers as if the information is your own knowledge, and avoid mentioning the word "document".`;

const getDataset = async (req, res) => {
  try {
    const { botId } = req.body;
    const rows = await Dataset.find({ botId: botId, trainflag: true });
    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getQRCode = async (req, res) => {
  const { phone, phoneTitle, userId } = req.body;
  try {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    const sendData = (data) => {
      const responseData = {
        data: data,
      };
      res.write(`data: ${JSON.stringify(responseData)}\n\n`);
    };

    const row = await Phone.findOne({ phone: phone });
    if (row) {
      if (row.delflag == false) {
        sendData("[DoublePhone]");
      }
    }

    const client = new Client({
      puppeteer: {
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      },
    });

    client.on("qr", (qr_data) => {
      sendData(qr_data);
    });

    client.on("ready", async () => {
      console.log("Client is ready!");
      if (row) {
        await Phone.updateOne({ phone: phone }, { $set: { delflag: false } });
      } else {
        await Phone.create({
          title: phoneTitle,
          phone: phone,
          botCount: 0,
          userId: userId,
          delflag: false,
        });
      }
      sendData("[DONE]");
      res.end();
    });

    client.on("message", async (message) => {
      if (message.body != "") {
        const senderTxt = message.from;
        const sender = senderTxt.split("@")[0];
        const row = await Phone.findOne({ phone: phone, delflag: false });
        if (row) {
          const phoneId = row._id.toString();
          const isblocked = await BlockList.findOne({
            phoneId: phoneId,
            phone: sender,
          });
          if (isblocked == null) {
            const botRow = await Chatbot.findOne({
              phoneId: phoneId,
              active: true,
            });
            if (botRow) {
              const reply = await getReply(message.body, botRow._id);
              message.reply(reply);
            }
          }
        }
      }
    });

    client.on("disconnected", async () => {
      console.log(`Client was disconnected`);
      client.destroy();
      await Phone.updateOne({ phone: phone }, { $set: { delflag: true } });
      // client.initialize();
    });

    client.initialize().catch((_) => _);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSitemapURL = async (req, res) => {
  const browser = await puppeteer.launch({
    headless: "true",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();
  let { URL } = req.body;
  if (!URL.startsWith("http://") && !URL.startsWith("https://")) {
    URL = "https://www." + URL;
  }
  try {
    if (URL) {
      await page.goto(URL, { waitUntil: "load", timeout: 0 });
      const linkHrefs = await page.$$eval("a", (links) =>
        links.map((link) => link.href)
      );
      const templinks = [];
      if (URL[URL.length - 1] == "/") URL = URL.slice(0, -1);
      templinks.push(URL);
      linkHrefs.map((linkHref) => {
        if (linkHref.includes(URL)) {
          if (templinks.includes(linkHref.split("#")[0]) == false) {
            let item = linkHref.split("#")[0];
            if (item[item.length - 1] == "/") item = item.slice(0, -1);
            templinks.push(item);
          }
        }
      });
      const links = [...new Set(templinks)];
      // const data = await getContentLength(links);
      res.status(200).json({
        data: links,
      });
      browser.close();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while crawling website.",
    });
    browser.close();
  }
};

const getSitemapXML = async (req, res) => {
  let { URL } = req.body;

  try {
    if (URL) {
      const sitemap = new Sitemapper();
      sitemap.fetch(URL).then(function (sites) {
        res.status(200).json({
          data: sites.sites,
        });
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "An error occurred while crawling website.",
    });
  }
};

const getReply = async (message, namespaceId) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    { pineconeIndex, namespace: namespaceId }
  );

  const CONDENSE_PROMPT = `Given the following conversation and a follow up question, rephrase the follow up question to be a standalone question.
        Chat History:
        {chat_history}
        Follow Up Input: {question}
        Standalone question:`;

  const QA_PROMPT = `
        ${sysPrompt} 
        =========
        {context}
        =========
        Question: {question}
        
        Answer:`;
  const chat = new ChatOpenAI({
    modelName: "gpt-4",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  const chain = ConversationalRetrievalQAChain.fromLLM(
    chat,
    vectorStore.asRetriever(),
    {
      qaTemplate: QA_PROMPT,
      questionGeneratorTemplate: CONDENSE_PROMPT,
      returnSourceDocuments: true,
    }
  );

  const result = await chain.call({
    question: message,
    chat_history: [],
  });
  return result.text;
};

const deleteDataset = async (req, res) => {
  const { id, botId } = req.body;
  try {
    const pinecone = new PineconeClient();
    await pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    const deleteRequest = {
      filter: { id: id },
      namespace: botId,
    };
    pineconeIndex._delete({ deleteRequest });
    await Dataset.deleteOne({ _id: id });
    let list = await Dataset.find({ botId: botId, trainflag: true });
    return res.status(200).json({ data: list });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const trainbot = async (req, res) => {
  const { links, botId, datasetType } = req.body;
  const files = req.files;
  let trainlinks = links;
  let trainfiles = files;

  try {
    if (datasetType == process.env.SITEMAPS_DATASETS) {
      if (links) {
        const xmlLinks = JSON.parse(links);
        if (xmlLinks) {
          const sitemap = new Sitemapper();
          let linksPromises = xmlLinks.map((link) => sitemap.fetch(link));
          let results = await Promise.all(linksPromises);

          // Extract the sites from each result
          trainlinks = results.flatMap((result) => result.sites);
        }
      }
      if (files) {
        const parser = new xml2js.Parser({ attrkey: "ATTR" });
        await Promise.all(
          files.map(async (file) => {
            fs.readFile(`uploads/${file.filename}`, function (err, data) {
              if (err) throw err;

              // Parse XML File
              parser.parseString(data, function (error, result) {
                if (error === null) {
                  trainlinks = result.urlset.url.map(
                    (urlItem) => urlItem.loc[0]
                  );
                } else {
                  return res.status(400).json({
                    message:
                      "File format error. Please refer the template file",
                  });
                }
              });
            });
          })
        );
      }
    }

    let vectorStore = [];
    let idlist = [];

    if (trainfiles) {
      await Promise.all(
        trainfiles.map(async (file) => {
          const newRow = await Dataset.create({
            botId: botId,
            title: file.originalname,
            datasetType: datasetType,
            trainflag: false,
          });
          idlist.push(newRow._id);
          let loader;
          let pageContent = null;
          const ext = file.filename.split(".").pop();
          const loaders = {
            pdf: PDFLoader,
            doc: DocxLoader,
            docx: DocxLoader,
            txt: TextLoader,
          };

          if (ext in loaders) {
            loader = new loaders[ext]("uploads/" + file.filename);
          }

          if (loader) {
            const docs = await loader.load();
            pageContent = docs[0].pageContent;
          }

          if (ext === "csv") {
            loader = new CSVLoader("uploads/" + file.filename);
            const docs = await loader.load();
            if (docs) {
              docs.map((item) => {
                pageContent += item.pageContent + ", ";
              });
            }
          }

          if (ext === "xls" || ext === "xlsx") {
            pageContent = await xlsContentLoader(file);
          }

          if (pageContent) {
            await splitContent(pageContent, newRow._id, vectorStore);
          }

          const directoryPath = "uploads/" + file.filename;
          await unlinkAsync(directoryPath);
        })
      );
    }

    if (trainlinks) {
      await Promise.all(
        trainlinks.map(async (link) => {
          let linkRegex = /^(http:|https:)?\/\/[^\s/$.?#].[^\s]*$/;
          if (!linkRegex.test(link)) {
            return res.status(400).json({
              message: "Invalid URL",
            });
          }
          const newRow = await Dataset.create({
            botId: botId,
            title: link,
            datasetType: datasetType,
            trainflag: false,
          });
          idlist.push(newRow._id);

          const browser = await puppeteer.launch({
            headless: "new",
            args: ["--no-sandbox"],
          });
          const page = await browser.newPage();

          await page.goto(link, {
            waitUntil: "domcontentloaded",
            timeout: 0,
          });

          const pageContent = await page.evaluate(() => {
            const scripts = document.body.querySelectorAll("script");
            const noscript = document.body.querySelectorAll("noscript");
            const styles = document.body.querySelectorAll("style");
            const scriptAndStyle = [...scripts, ...noscript, ...styles];
            scriptAndStyle.forEach((e) => e.remove());

            const mainElement = document.querySelector("main");
            return mainElement
              ? mainElement.innerText
              : document.body.innerText;
          });

          if (pageContent)
            await splitContent(pageContent, newRow._id, vectorStore);

          await browser.close();
        })
      );
    }

    if (vectorStore) {
      const pinecone = new PineconeClient();
      await pinecone.init({
        apiKey: process.env.PINECONE_API_KEY,
        environment: process.env.PINECONE_ENVIRONMENT,
      });
      const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
      await PineconeStore.fromDocuments(vectorStore, new OpenAIEmbeddings(), {
        pineconeIndex,
        maxConcurrency: 5,
        namespace: botId,
      });
    }

    const itemIds = idlist.map((item) => item);
    await Dataset.updateMany(
      { _id: { $in: itemIds } },
      { $set: { trainflag: true } }
    );
    rows = await Dataset.find({ botId: botId, trainflag: true });

    return res.status(200).json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

async function xlsContentLoader(file) {
  const workbook = xlsx.readFile("uploads/" + file.filename);
  const workbookSheet = workbook.SheetNames;
  const res = xlsx.utils.sheet_to_json(workbook.Sheets[workbookSheet[0]]);
  let content = "";
  for (let i = 0; i < res.length; i++) {
    content += JSON.stringify(res[i]).replaceAll(",", "\n");
  }
  return content;
}

async function splitContent(pageContent, id, vectorStore) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 20,
  });
  const output = await splitter.createDocuments([pageContent]);

  output.map((item) => {
    vectorStore.push(
      new Document({
        metadata: {
          ...item.metadata,
          id: id.toString(),
        },
        pageContent: item.pageContent,
      })
    );
  });
}

module.exports = {
  getDataset,
  getSitemapURL,
  getSitemapXML,
  getQRCode,
  deleteDataset,
  trainbot,
};
