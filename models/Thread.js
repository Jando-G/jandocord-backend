const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    content: { type: String, required: true, minLength: 1, maxLength: 255},
    date: {type: Date, required: true},
    sender: {type: String, required: true}
  });

const Thread = new Schema({
    whiteList: [String],
    messages: [MessageSchema],
  });
  
  module.exports = mongoose.model("Thread", Thread, 'threads');