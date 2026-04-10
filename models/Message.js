const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema({
  username: String,
  text: String,
  room: String,
  time: String
});

module.exports = mongoose.model("Message", MessageSchema);