const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // This should match your frontend URL
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"],
    credentials: true,
  },
});

const passcodes = [];
const Rooms = {};

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("message", (message) => {
    console.log("Message received:", message.message, "from", message.sender);
    socket.to(Rooms[socket.id]).emit("message", message);
  });

  socket.on("passcode", (passcode) => {
    Rooms[socket.id] = passcode;
    if (passcodes.includes(passcode)) {
      socket.join(passcode);
      console.log("Joined room", passcode);
      io.to(passcode).emit("connection", true);
    } else {
      passcodes.push(passcode);
      socket.join(passcode);
      console.log("waiting in room", passcode);
    }
  });
});

server.listen(8080, () => {
  console.log("Listening on *:8080");
});
