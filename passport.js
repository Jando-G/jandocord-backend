const passport = require('passport');
const DiscordStrategy = require('passport-discord').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;
const User = require('./models/User');

passport.serializeUser((user, done) => {
    done(null, user);
  });
  
  passport.deserializeUser((user, done) => {
    done(null, user);
  });

const cookieExtractor = function(req) {
    let token = null;
    if (req && req.cookies) token = req.cookies['jwt'];
    return token;
  };

passport.use(new JWTStrategy({
    jwtFromRequest: cookieExtractor,
    secretOrKey : 'your_jwt_secret'
},
function (jwtPayload, cb) {
    //find the user in db if needed. This functionality may be omitted if you store everything you'll need in JWT payload.
    return User.findById(jwtPayload.user._id)
        .then(user => {
            return cb(null, user);
        })
        .catch(err => {
            return cb(err);
        });
}
));

const scopes = ['identify', 'email', 'guilds', 'guilds.join'];

const discordStrat = new DiscordStrategy({
    clientID: process.env.CLIENT_ID,
    clientSecret: process.env.SECRET_KEY,
    callbackURL: 'https://jandocord-d39f82b85605.herokuapp.com/auth/login/callback',
    scope: scopes
  },
    function (accessToken, refreshToken, profile, done) {
        User.findOne({
            discordId: profile.id 
        }).then((err, user) => {
            if (err) {
                return done(err);
            }
            //No user was found... so create a new user with values from discord
            if (!user) {
                user = new User({
                    discordId: profile.id,
                    username: profile.username,
                    discriminator: profile.discriminator,
                    email: profile.email,
                    avatar: profile.avatar,
                });
                user.save().then(user => {
                    return done(null, user);
                });
            } else {
                //found user. Return
                return done(err, user);
            }

    });
        
    });

passport.use(discordStrat);
