//routes/user.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const cookieParser = require('cookie-parser');

const checkToken = (req, res, next) => {

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
      message: "failed",
      user: req.user,
    })
  }
});

module.exports = router;