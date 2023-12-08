const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const phoneController = require("./controllers/phoneController");
const bodyParser = require("body-parser");
require("dotenv").config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
process.setMaxListeners(0);

app.use(express.static(path.join(__dirname, "resources")));

// Set up bodyParser middleware
app.use(bodyParser.urlencoded({ limit: "100MB", extended: true }));
app.use(bodyParser.json({ limit: "100MB" }));

// Define Routes
app.use("/api/auth", require("./routers/authRouter"));
app.use("/api/user", require("./routers/userRouter"));
app.use("/api/phone", require("./routers/phoneRouter"));
app.use("/api/chatbot", require("./routers/chatbotRouter"));
app.use("/api/dataset", require("./routers/datasetRouter"));
app.use("/api/blocklist", require("./routers/blocklistRouter"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal server error" });
});

// Connect MongoDB and start the server
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
    phoneController.initDB();
  })
  .catch((err) => console.error(err));
