const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const FriendSchema = new Schema({
  id: { type: String, required: true},
  username: { type: String, required: true},
  avatar: { type: String, required: true},
  discriminator: { type: String, required: true},
});

const User = new Schema({
    discordId: { type: String, required: true},
    username: { type: String, required: true},
    discriminator: { type: String, required: true},
    email: { type: String, required: true},
    avatar: { type: String, required: true},
    friends: [FriendSchema],
  });
  
  module.exports = mongoose.model("User", User, 'userData');