const router = require('express').Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');


router.get('/login/callback', function (req, res, next) {
  passport.authenticate('discord', {session: false}, (user, err, info) => {
          if (err || !user) {
              return res.status(401).json({
                  success: false,
                  error: err,
                  usr: user,
                  message: 'Something is not right',
              });
          }
  req.login(user, {session: false}, (err) => {
             if (err) {
                 res.send(err);
             }
             // generate a signed son web token with the contents of user object and return it in the response
             const token = jwt.sign({user}, 'i_watched_sailormoon', {expiresIn: '1d'});
             res.cookie('jwt', token, { httpOnly: true, sameSite: 'none', secure: true, })
             console.log("the token assigned: " + token)
             return res.redirect(`jandocord.netlify.app/`);
          });
      })(req, res);
  });

router.get('/login', passport.authenticate('discord', {session: false}));

router.post('/logout', (req,res) => {
    res.clearCookie('jwt');
    req.logout();
    return res.status(200).json({
        success: true,
        message: 'Logged out',
    });
})


module.exports = router;