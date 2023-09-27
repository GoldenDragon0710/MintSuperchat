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
app.use(bodyParser.urlencoded({ limit: '100MB', extended: true }));
app.use(bodyParser.json({ limit: '100MB' }));

app.use("/api/chatbot", chatbotRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Connect to MongoDB and start the server
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
    app.listen(process.env.PORT, () => {
      console.log(`Server started on port ${process.env.PORT}`);
    });
  })
  .catch((err) => console.error(err));
