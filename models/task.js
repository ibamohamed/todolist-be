const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const taksSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  date_created: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    required: true
  }
});

module.exports = mongoose.model("Task", taksSchema);
