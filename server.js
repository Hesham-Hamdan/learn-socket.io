const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const port = 3000;

const connectedUsers = {};

app.use(express.static("client"));

io.on("connection", (socket) => {
  console.log(`A user connected with id ${socket.id}`);

  socket.on("new user", (nickName) => {
    socket.nickName = nickName;
    connectedUsers[socket.id] = nickName;
    console.log(connectedUsers);
    console.log(`${nickName} has connected, his id is: ${socket.id}`);
    io.emit("usersList", connectedUsers);
    socket.broadcast.emit("new user", nickName);
  });

  socket.on("group message", (nickName, msg) => {
    console.log(msg);
    socket.broadcast.emit("group message", nickName, msg);
  });

  socket.on("userIsTyping", (nickName) => {
    socket.broadcast.emit("userIsTyping", nickName);
  });

  socket.on("userIsNotTyping", () => {
    socket.broadcast.emit("userIsNotTyping");
  });

  socket.on("disconnect", () => {
    console.log(`User with id ${socket.id} Disconnected`);
    socket.broadcast.emit("user left", socket.nickName);
    delete connectedUsers[socket.id];
    io.emit("usersList", connectedUsers);
    console.log(connectedUsers);
  });
});

server.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
