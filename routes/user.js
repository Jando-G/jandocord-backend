//routes/user.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const Thread = require('../models/Thread');
const crypto = require('crypto');
const mongoose = require("mongoose");

router.get("/profile", passport.authenticate('jwt', {session: false}), (req, res) => {
  if (req.user) {
    res.status(200).send({
      success: true,
      message: "successfull",
      user: req.user,
    });
  }
  else {
    res.status(420).send({
      success: false,
      message: "failed",
      user: req.user,
    })
  }
});

function generateChatId(userId1, userId2) {
  const sortedUserIds = [userId1, userId2].sort();
  const combinedId = sortedUserIds.join('');
  const hash = crypto.createHash('sha256').update(combinedId).digest('hex');
  const uniqueId = hash.slice(0, 24);
  return uniqueId;
}

router.post("/addfriend", passport.authenticate('jwt', {session: false}), async (req, res) => {
   // check if user already added friend
   const isFriendAdded = req.user.friends.some(
    friend => friend.username === req.body.username && friend.discriminator === req.body.discriminator
  );
  if(isFriendAdded) {
    return res.status(409).send({
      success: false,
      message: "Friend is already added",
    })
  }

  // Get friend data
  const friendObject = await User.findOne({username: req.body.username, discriminator: req.body.discriminator});
  
  // no friend found
  if(!friendObject) {
    return res.status(404).send({
      success: false,
      message: "Friend not found",
    })
  }

  // check if thread has already been created and if not create it
  const threadId = new mongoose.Types.ObjectId(generateChatId(req.user._id, friendObject._id));

  const thread = await Thread.findById(threadId);


  // no thread so create it
  if(!thread) {
    const newThread = new Thread({
      _id: threadId,
      whiteList: [req.user._id, friendObject._id],
      Messages: [],
    })
    newThread.save();
  }

  // add friend and thread to friends array
  const newFriend = {
    id: friendObject._id,
    username: friendObject.username,
    avatar: friendObject.avatar,
    discriminator: friendObject.discriminator,
  }

  req.user.friends.push(newFriend);
  req.user.save()
  .then(savedUser => {
    // User data saved successfully
    res.status(200).json({
      success: true,
      message: 'Friend added successfully',
      user: savedUser,
    });
  })
  .catch(error => {
    // Error occurred
    res.status(500).json({
      success: false,
      message: 'Failed to add friend',
      error: error.message,
    });
  });
})


module.exports = router;