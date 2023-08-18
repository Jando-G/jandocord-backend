//routes/user.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const Thread = require('../models/Thread');
const crypto = require('crypto');
const mongoose = require("mongoose");

function generateChatId(userId1, userId2) {
  const sortedUserIds = [userId1, userId2].sort();
  const combinedId = sortedUserIds.join('');
  const hash = crypto.createHash('sha256').update(combinedId).digest('hex');
  const uniqueId = hash.slice(0, 24);
  return uniqueId;
}

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
      message: "User not logged in",
    })
  }
});

router.get("/messages", passport.authenticate('jwt', {session: false}), async (req, res) => {
  if (req.user) {
    const threadId = new mongoose.Types.ObjectId(generateChatId(req.user._id, req.query.friendId));
    const thread = await Thread.findById(threadId);
    if(thread) {
      res.status(200).send({
        success: true,
        message: "successfull",
        messages: thread.messages,
        threadId: threadId, //giving away decrypted id fine since I'm implementing the whitelist later
      });
    }
    else {
      res.status(666).send({
        success: false,
        message: "Thread somehow doesn't exist",
      })
    }
  }
  else {
    res.status(420).send({
      success: false,
      message: "User not logged in",
    })
  }
});

router.get("/search", async (req, res) => {
    try {
      const searchQuery = req.query.q;
      const users = await User.find({
        username: { $regex: new RegExp(searchQuery, 'i') }, 
      }).select('username discriminator discordId avatar'); 
      res.json(users);
    } catch (error) {
      console.error('Error searching for users:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
});

router.post("/send", passport.authenticate('jwt', {session: false}), async (req, res) => {

  if(!req.body.message) {
    return res.status(422).send({
      success: false,
      message: "Message must have content",
    })
  }
  if (req.user) {
    const threadId = new mongoose.Types.ObjectId(generateChatId(req.user._id, req.body.friendId))
    const thread = await Thread.findById(threadId);

    const newMessage = {
      content: req.body.message,
      date: new Date(),
      sender: req.user._id,
    }

    thread.messages.push(newMessage);

    await thread.save();

    res.status(200).send({
      success: true,
      message: newMessage,
    });
  }
  else {
    res.status(420).send({
      success: false,
      message: "User not logged in",
    })
  }
});

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
    discordId: friendObject.discordId,
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

router.put("/removefriend/:friendId", passport.authenticate('jwt', {session: false}), async (req, res) => {

  // check if user already added friend
  const isFriendAdded = req.user.friends.some(
   friend => friend.id === req.params.friendId
 );
 if(isFriendAdded) {
  try {
    req.user.friends.pull({id: req.params.friendId});
    req.user.save(); //doesnt return updated user like it should. big sadge
    res.json("removed friend successfully");
  } catch (error){
    res.status(500).json({ error: 'Error while removing friend' });
  }
 }
 else {
  return res.status(409).send({
    success: false,
    message: "Friend is already removed",
  })
 }
})


module.exports = router;