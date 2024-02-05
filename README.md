# Mint Superchat

This is WhatsApp Business Chatbot using WhatsApp Business API.

The user can upload various datasets such as PDF, Docx, Txt, CSV, and website link etc.

The system is using LangChain(LLMs framework) and Pinecone(online vector database) for training the various datasets into the OpenAI GPT-4 model


## Quick start

Frontend: 
```
npm install
npm run dev
```
Backend: 
```
npm install
npm start
```


Then you should create a folder called "uploads" for storing the files uploaded.

Also you should create .env file

```
PINECONE_API_KEY = 
PINECONE_ENVIRONMENT = 
PINECONE_INDEX = 
PORT = 3000
MONGO_URI = 
OPENAI_API_KEY = 
JWT_SECRET = secret
SITEMAPS_DATASETS = SITEMAPS_DATASETS
```

You can check the project with this link: `http://localhost:5173`
