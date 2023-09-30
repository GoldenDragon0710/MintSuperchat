const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
process.setMaxListeners(0);

// Routes
const chatbotRouter = require("./routers/chatbotRouter");

// Set up bodyParser middleware
app.use(bodyParser.urlencoded({ limit: "100MB", extended: true }));
app.use(bodyParser.json({ limit: "100MB" }));

app.use("/api/chatbot", chatbotRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Connect to MongoDB and start the server

const connectDB = require("./app/config/db.config");
connectDB();

app.listen(PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}.`);
});
