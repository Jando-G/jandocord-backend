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
    return User.findById(jwtPayload.user.doc._id)
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
    callbackURL: '/auth/login/callback',
    scope: scopes
  },
    function (accessToken, refreshToken, profile, cb) {
        console.log(profile)
        return User.findOrCreate({ discordId: profile.id })
            .then(user=> {
                if (!user) {
                    return cb(null, false, {message: 'Incorrect email or password.'});
                }
        return cb(null, user, {message: 'Logged In Successfully'});
            }).catch(err => cb(err))
    });

passport.use(discordStrat);
