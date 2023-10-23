const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { ConversationalRetrievalQAChain } = require("langchain/chains");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { DocxLoader } = require("langchain/document_loaders/fs/docx");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { Document } = require("langchain/document");
const Dataset = require("../models/Dataset");
const User = require("../models/User");
const xlsx = require("xlsx");
const Papa = require("papaparse");
const fs = require("fs");
const puppeteer = require("puppeteer");
const { promisify } = require("util");
const readFileAsync = promisify(fs.readFile);
const unlinkAsync = promisify(fs.unlink);
const { Client } = require("whatsapp-web.js");
const Chatbot = require("../models/Chatbot");
require("dotenv").config();

const sysPrompt = `You are an AI assistant providing helpful answers based on the context to provide conversational answer without any prior knowledge. You are given the following extracted parts of a long document and a question. If you can't find the answer in the context below, just say "Thank you for your question. I can not help you on this topic. Please look online using a search engine.". You can also ask the user to rephrase the question if you need more context. But don't try to make up an answer. If the question is not related to the context, politely respond that you are tuned to only answer questions that are related to the context. Answer in a concise or elaborate format as per the intent of the question.`;

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
  const { phone } = req.body;
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

    const row = await User.findOne({ phone: phone });
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
        await User.updateOne({ phone: phone }, { $set: { delflag: false } });
      } else {
        const title = `bot-${phone}`;
        await User.create({
          title: title,
          phone: phone,
          botCount: 0,
          delflag: false,
        });
      }
      sendData("[DONE]");
      res.end();
    });

    client.on("message", async (message) => {
      if (message.body != "") {
        const userRow = await User.findOne({ phone: phone });
        const userId = userRow._id.toString();
        const botRow = await Chatbot.findOne({
          userId: { $in: userId },
          active: true,
        });
        if (botRow) {
          const reply = await getReply(message.body, botRow._id);
          message.reply(reply);
        }
      }
    });

    client.initialize();
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getSitemap = async (req, res) => {
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
  const { links, botId } = req.body;
  const files = req.files;
  let vectorStore = [];
  let idlist = [];
  try {
    if (files) {
      await Promise.all(
        files.map(async (file) => {
          const newRow = await Dataset.create({
            botId: botId,
            title: file.originalname,
            trainflag: false,
          });
          idlist.push(newRow._id);
          let loader;
          let pageContent = null;
          const ext = file.filename.split(".")[1];
          const loaders = {
            pdf: PDFLoader,
            doc: DocxLoader,
            docx: DocxLoader,
            txt: TextLoader,
          };

          if (ext in loaders) {
            loader = new loaders[ext]("uploads/" + file.filename);
          }

          const contentLoaders = {
            csv: async () => {
              const directoryPath = "uploads/" + file.filename;
              const fileData = await readFileAsync(directoryPath, "utf8");
              const result = Papa.parse(fileData, { header: true });
              return JSON.stringify(result.data);
            },
            xls: xlsContentLoader,
            xlsx: xlsContentLoader,
          };

          if (ext in contentLoaders) {
            pageContent = await contentLoaders[ext]();
          }

          if (loader) {
            const docs = await loader.load();
            pageContent = docs[0].pageContent;
          }

          if (pageContent) {
            await splitContent(pageContent, newRow._id, vectorStore);
          }

          const directoryPath = "uploads/" + file.filename;
          await unlinkAsync(directoryPath);
        })
      );
    }

    if (links) {
      await Promise.all(
        links.map(async (link) => {
          const newRow = await Dataset.create({
            botId: botId,
            title: link,
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

async function xlsContentLoader() {
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
  getSitemap,
  getQRCode,
  deleteDataset,
  trainbot,
};
