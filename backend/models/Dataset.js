const mongoose = require("mongoose");

const datasetSchema = new mongoose.Schema(
  {
    userId: String,
    phoneId: String,
    botId: String,
    title: String,
    datasetType: String,
    trainflag: Boolean,
  },
  { timestamps: true }
);

const Dataset = mongoose.model("Dataset", datasetSchema);
module.exports = Dataset;
