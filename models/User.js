const mongoose = require("mongoose");
const findOrCreate = require("mongoose-findorcreate");

const Schema = mongoose.Schema;

const User = new Schema({
    discordId: { type: String, required: true},
    username: { type: String, required: true},
    discriminator: { type: String, required: true},
    email: { type: String, required: true},
    avatar: { type: String, required: true},
  });
  User.plugin(findOrCreate);
  module.exports = mongoose.model("User", User);