const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema(
  {
    botId: String,
    title: String,
    trainflag: Boolean,
  },
  { timestamps: true }
);

const Dataset = mongoose.model("Dataset", datasetSchema);
module.exports = Dataset;
