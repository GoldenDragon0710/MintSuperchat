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
const fs = require("fs");
const path = require("path");
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
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "An error occurred while crawling website.",
    });
    browser.close();
  }
};

exports.training_files = async (req, res, next) => {
  const files = req.files;
  if (files) {
    let vectorStore = [];
    await Promise.all(
      files.map(async (file) => {
        try {
          const dbData = await insertRow(file.originalname);
          await createVectorStore_file(
            file,
            dbData._id.toString(),
            vectorStore
          );
          const uploadFolderPath = path.join(__dirname, "../uploads");
          const directoryPath = uploadFolderPath + "/" + file.filename;
          fs.unlink(directoryPath, (err) => {
            if (err) throw err;
          });
        } catch (err) {
          console.log(err);
          return res.status(500).json({ message: "Internal server error" });
        }
      })
    );

    await storeVectorData(vectorStore);
    const rows = await getAllRows();
    return res.json({ data: rows });
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
      res.json({ data: rows });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.training_FAQs = async (req, res, next) => {
  const files = req.files;
  if (files) {
    let vectorStore = [];
    await Promise.all(
      files.map(async (file) => {
        try {
          const dbData = await insertRow(file.originalname);
          let JSONData = await detectingCSV(file);
          await createVectorStore_JSON(
            JSONData,
            dbData._id.toString(),
            vectorStore
          );

          const uploadFolderPath = path.join(__dirname, "../uploads");
          const directoryPath = uploadFolderPath + "/" + file.filename;
          fs.unlink(directoryPath, (err) => {
            if (err) throw err;
          });
        } catch (err) {
          console.log(err);
          // throw err;
          return res.status(500).json({ message: "Internal server error" });
        }
      })
    );
    await storeVectorData(vectorStore);
    const rows = await getAllRows();
    return res.json({ data: rows });
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
    pineconeIndex._delete({ deleteRequest });
    const list = await deleteRows(id);
    return res.json({ data: list });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getReply = async (req, res, next) => {
  const message = req.body.Body;

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
  try {
    const twiml = new twilio.twiml.MessagingResponse();
    twiml.message(result.text);
    res.send(twiml.toString());
  } catch (err) {
    console.log(err);
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

async function createVectorStore_file(file, id, vectorStore) {
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
  const output = await splitContent(docs[0].pageContent, id, vectorStore);
  return output;
}

async function handleXlsxFile(file, id, vectorStore) {
  const workbook = xlsx.readFile("uploads/" + file.filename);
  let workbook_sheet = workbook.SheetNames;
  let res = xlsx.utils.sheet_to_json(workbook.Sheets[workbook_sheet[0]]);
  let temp = "";
  for (let i = 0; i < res.length; i++) {
    temp.concat(JSON.stringify(res[i]).replaceAll(",", "\n"));
  }
  const output = await splitContent(temp, id, vectorStore);
  return output;
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
          id: id,
        },
        pageContent: item.pageContent,
      })
    );
  });
}

async function storeVectorData(docs) {
  if (docs) {
    const pinecone = new PineconeClient();
    await pinecone.init({
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.PINECONE_ENVIRONMENT,
    });
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX);
    PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
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
    await Chatbot.deleteOne({ _id: id });
    const list = await getAllRows();
    return list;
  } catch (err) {
    console.log(err);
  }
}

async function trainingFromLinks(links) {
  if (links) {
    let vectorStore = [];
    await Promise.all(
      links.map(async (link) => {
        try {
          const dbData = await insertRow(link);
          await createVectorStore_link(
            link,
            dbData._id.toString(),
            vectorStore
          );
        } catch (err) {
          console.log(err);
          throw err;
        }
      })
    );
    await storeVectorData(vectorStore);
  }
  return;
}

async function createVectorStore_link(link, id, vectorStore) {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox"],
  });
  const page = await browser.newPage();

  await page.goto(link, {
    waitUntil: "domcontentloaded",
    timeout: 0,
  });

  const docs = await page.evaluate(() => {
    const scripts = document.body.querySelectorAll("script");
    const noscript = document.body.querySelectorAll("noscript");
    const styles = document.body.querySelectorAll("style");
    const scriptAndStyle = [...scripts, ...noscript, ...styles];
    scriptAndStyle.forEach((e) => e.remove());

    const mainElement = document.querySelector("main");
    return mainElement ? mainElement.innerText : document.body.innerText;
  });

  let output = null;
  if (docs) output = await splitContent(docs, id, vectorStore);
  return output;
}

async function detectingCSV(file) {
  const uploadFolderPath = path.join(__dirname, "../uploads");
  const directoryPath = uploadFolderPath + "/" + file.filename;
  const fileData = fs.readFileSync(directoryPath, "utf8");
  const result = Papa.parse(fileData, { header: true });
  return result.data;
}

async function createVectorStore_JSON(JSONData, id, vectorStore) {
  const output = await splitContent(JSON.stringify(JSONData), id, vectorStore);
  return output;
}
