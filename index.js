const express = require('express');
const app = express();
cors = require("cors");
require('dotenv').config();
const mongoose = require("mongoose");
const refresh = require('passport-oauth2-refresh');
const passport = require('passport');
const User = require('./models/User.js');
const cookieSession = require('cookie-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
require('./passport');

app.use(
  cors({
    origin: "http://localhost:3000",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

app.use('/auth', authRouter);
app.use('/user', userRouter);
//passport.authenticate('jwt', {session: false}), userRouter
mongoose.set('strictQuery', false);
mongoose.set("debug", (collectionName, method, query, doc) => {
  console.log(`${collectionName}.${method}`, JSON.stringify(query), doc);
});
const uri = "mongodb+srv://Jando:UcgTNZY9jY4XRGto@authentication.dypavvc.mongodb.net/?retryWrites=true&w=majority";
main().catch(err => console.log(err));
async function main() {
  await mongoose.connect(uri, {dbName: 'data'});
}

const port = "5000"
app.listen(port, () => {
  console.log("Server is running on port " + port);
})
