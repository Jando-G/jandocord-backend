const express = require('express');
const app = express();
cors = require("cors");
require('dotenv').config();
const mongoose = require("mongoose");
const passport = require('passport');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRouter = require('./routes/auth');
const userRouter = require('./routes/user');
const { instrument } = require('@socket.io/admin-ui')
const { createServer } = require("http");
const { Server } = require("socket.io");

require('./passport');

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:3000', "https://admin.socket.io", "jandocord.netlify.app"],
    credentials: true
  }
});

instrument(io, {auth: false});

io.on('connection', socket => {
  console.log(`User ${socket.id} connected`)
  socket.on('join-thread', threadId=> {
    socket.join(threadId);
    console.log(`User ${socket.id} joined thread room: ${threadId}`);
  })
  socket.on('leave-thread', threadId => {
    socket.leave(threadId);
    console.log(`User ${socket.id} left thread room: ${threadId}`);
  });
  socket.on('send-message', (message, room) => {
    socket.to(room).emit('recieve-message', message);
    console.log(`Sent a message to  ${room}`);
  });
  socket.on('join-room', (room) => {
    socket.join(room);
  });
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User ${socket.id} disconnected`);
  });
})

app.use(cors( {
  origin: ['http://localhost:3000', 'jandocord.netlify.app'],
  credentials: true,
}));

// Set the Access-Control-Allow-Credentials header for all routes
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

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

app.get('/', (req, res) => {
  res.send("Server is up and running on port " + process.env.PORT + " ☕️");
})

httpServer.listen(process.env.PORT, () => {
  console.log("Server is running on port " + (process.env.PORT));
});
