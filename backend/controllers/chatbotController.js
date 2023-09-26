const Chatbot = require("../models/Chatbot");
const puppeteer = require("puppeteer");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { PineconeStore } = require("langchain/vectorstores/pinecone");
const { PineconeClient } = require("@pinecone-database/pinecone");
const { ChatOpenAI } = require("langchain/chat_models/openai");
const { ConversationalRetrievalQAChain } = require("langchain/chains");
const {
  PuppeteerWebBaseLoader,
} = require("langchain/document_loaders/web/puppeteer");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { DocxLoader } = require("langchain/document_loaders/fs/docx");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { CSVLoader } = require("langchain/document_loaders/fs/csv");
const xlsx = require("xlsx");
const { Document } = require("langchain/document");
const Papa = require("papaparse");
const twilio = require("twilio");
require("dotenv").config();

exports.getDataset = async (req, res, next) => {
  try {
    const rows = await getAllRows();
    return res.json({ data: rows });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSitemap = async (req, res, next) => {
  const browser = await puppeteer.launch({
    headless: "new",
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
      linkHrefs.map((linkHref) => {
        if (linkHref.includes(URL)) {
          templinks.push(linkHref.split("#")[0]);
        }
      });
      const links = [...new Set(templinks)];
      // const data = await getContentLength(links);
      res.status(200).json({
        data: links,
      });

      await browser.close();
    }
  } catch (error) {
    console.error(error);
    await browser.close();
    res.status(500).json({
      message: "An error occurred while crawling website.",
    });
  }
};

exports.training_files = async (req, res, next) => {
  const files = req.files;
  if (files) {
    await Promise.all(
      files.map(async (file) => {
        try {
          const dbData = await insertRow(file.originalname);
          const docs = await createVectorStore_file(
            file,
            dbData._id.toString()
          );
          await storeVectorData(docs);
          const rows = await getAllRows();
          return res.json({ data: rows });
        } catch (err) {
          console.log(err);
          return res.status(500).json({ message: "Internal server error" });
        }
      })
    );
  } else {
    return res.status(500).json({ message: "No file is selected." });
  }
};

exports.training_links = async (req, res, next) => {
  const links = req.body.links;
  try {
    if (links) {
      await trainingFromLinks(links);
      const rows = await getAllRows();
      return res.json({ data: rows });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.training_sitemap = async (req, res, next) => {
  const links = req.body.links;
  try {
    if (links) {
      await trainingFromLinks(links);
      const rows = await getAllRows();
      return res.json({ data: rows });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.training_FAQs = async (req, res, next) => {
  const files = req.files;

  if (files) {
    await Promise.all(
      files.map(async (file) => {
        try {
          const dbData = await insertRow(file.originalname);
          let JSONData = await detectingCSV(file);
          const docs = await createVectorStore_JSON(
            JSONData,
            dbData._id.toString()
          );
          await storeVectorData(docs);
          const rows = await getAllRows();
          return res.json({ data: rows });
        } catch (err) {
          console.log(err);
          // throw err;
          return res.status(500).json({ message: "Internal server error" });
        }
      })
    );
  } else {
    return res.status(500).json({ message: "No file is selected." });
  }
};

exports.deleteDataset = async (req, res, next) => {
  const id = req.body.id;
  try {
    const pinecone = new PineconeClient();
    await pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    const deleteRequest = {
      filter: { id: id },
      namespace: process.env.PINECONE_NAMESPACE,
    };
    await pineconeIndex._delete({ deleteRequest });
    await deleteRows(id);
    const list = await getAllRows();
    return res.json({ data: list });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReply = async (req, res, next) => {
  const message = req.body.Body;
  console.log("param---", message);

  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
    { pineconeIndex, namespace: process.env.PINECONE_NAMESPACE }
  );

  const CONDENSE_PROMPT = `Rephrase the follow up question to be a standalone question.
        Chat History:
        {chat_history}
        Follow Up Input: {question}
        Standalone question:`;

  const QA_PROMPT = `
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
  console.log("rsult---", result.text);
  try {
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(result.text);
    res.send(twiml.toString());
  } catch {
    console.log("error", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

async function insertRow(name) {
  try {
    const newRow = await Chatbot.create({ name: name });
    return newRow;
  } catch (error) {
    console.error(error);
  }
}

async function createVectorStore_file(file, id) {
  let loader;
  const ext = file.filename.split(".")[1];
  if (ext === "pdf") {
    loader = new PDFLoader("uploads/" + file.filename, { splitPages: false });
  } else if (ext === "doc" || ext === "docx") {
    loader = new DocxLoader("uploads/" + file.filename);
  } else if (ext === "txt") {
    loader = new TextLoader("uploads/" + file.filename);
  } else if (ext === "csv") {
    loader = new CSVLoader("uploads/" + file.filename);
  } else if (ext === "xls" || ext === "xlsx") {
    const temp = await handleXlsxFile(file, id);
    return temp;
  } else {
    return;
  }
  const docs = await loader.load();
  const output = await splitContent(docs[0].pageContent, id);
  return output;
}

async function handleXlsxFile(file, id) {
  const workbook = xlsx.readFile("uploads/" + file.filename);
  let workbook_sheet = workbook.SheetNames;
  let res = xlsx.utils.sheet_to_json(workbook.Sheets[workbook_sheet[0]]);
  let temp = "";
  for (let i = 0; i < res.length; i++) {
    temp.concat(JSON.stringify(res[i]).replaceAll(",", "\n"));
  }
  const output = await splitContent(temp, id);
  return output;
}

async function splitContent(pageContent, id) {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 300,
    chunkOverlap: 20,
  });
  const output = await splitter.createDocuments([pageContent]);

  const result = [];
  output.map((item) => {
    result.push(
      new Document({
        metadata: {
          ...item.metadata,
          id: id,
        },
        pageContent: item.pageContent,
      })
    );
  });

  // console.log(result.map((item) => item.metadata));
  return result;
}

async function storeVectorData(docs) {
  if (docs.length) {
    const pinecone = new PineconeClient();
    await pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
      pineconeIndex,
      maxConcurrency: 5,
      namespace: process.env.PINECONE_NAMESPACE,
    });
  }
}

async function getAllRows() {
  try {
    const rows = await Chatbot.find({});
    let list = [];
    if (rows) {
      rows.map((item) => {
        list.push({ name: item.name, _id: item._id });
      });
    }
    return list;
  } catch (error) {
    console.error(error);
  }
}

async function deleteRows(id) {
  try {
    const result = await Chatbot.deleteOne({ _id: id });
    return result;
  } catch (err) {
    console.log(err);
  }
}

async function trainingFromLinks(links) {
  if (links.length) {
    await Promise.all(
      links.map(async (link, idx) => {
        try {
          const dbData = await insertRow(link);
	  const docs = await createVectorStore_link(
            link,
            dbData._id.toString()
          );
          await storeVectorData(docs);
        } catch (err) {
          console.log(err);
          throw err;
        }
      })
    );
  }
  return;
}

async function createVectorStore_link(link, id) {
  const loader = new PuppeteerWebBaseLoader(link, {
    launchOptions: {
      headless: "new",
      args: ["--no-sandbox"],
    },
    async evaluate(page) {
      const result = await page.evaluate(() => {
        const scripts = document.body.querySelectorAll("script");
        const noscript = document.body.querySelectorAll("noscript");
        const styles = document.body.querySelectorAll("style");
        const scriptAndStyle = [...scripts, ...noscript, ...styles];
        scriptAndStyle.forEach((e) => e.remove());

        const mainElement = document.querySelector("main");
        return mainElement ? mainElement.innerText : document.body.innerText;
      });
      return result;
    },
  });

  const docs = await loader.load();
  const output = await splitContent(docs[0].pageContent, id);
  return output;
}

async function detectingCSV(file) {
  await new Promise((resolve, reject) => {
    Papa.parse(file, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        if (result.data.length != 0) {
          return result.data;
        }
        resolve();
      },
      error: (err) => {
        console.log(err);
        reject(err);
      },
    });
  });
}

async function createVectorStore_JSON(JSONData, id) {
  const output = await splitContent(JSON.stringify(JSONData), id);
  return output;
}
