const express = require('express');
const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');


router.get('/login/callback', function (req, res, next) {
  passport.authenticate('discord', {session: false}, (err, user, info) => {
          if (err || !user) {
              return res.status(401).json({
                  success: false,
                  message: 'Something is not right',
              });
          }
  req.login(user, {session: false}, (err) => {
             if (err) {
                 res.send(err);
             }
  // generate a signed son web token with the contents of user object and return it in the response
  const token = jwt.sign({user}, 'your_jwt_secret');
  res.cookie('jwt', token, { httpOnly: true });
             return res.redirect(`http://localhost:3000/`);
          });
      })(req, res);
  });

router.get('/login', passport.authenticate('discord', {session: false}));

router.get('/logout', (req,res) => {
     req.logout();
     res.redirect('http://localhost:3000/');
})


module.exports = router;