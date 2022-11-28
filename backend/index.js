require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: { origin: "*" },
});

app.get("/", (req, res) => {
  res.send({
    success: true,
    message: "Hello world,this is websocket server for simple chat app",
  });
});

const USERS = [];

// socket io on connected user
io.on("connection", (socket) => {
  console.log(socket.id + "a user connected");
  // disconnected user
  socket.on("disconnect", () => {
    console.log(socket.id + "user diconnected");
  });

  // listen message
  socket.on("message", (message) => {
    message.date = new Date().toLocaleString();
    console.log(message);
    io.emit("message", message);
  });

  // is typing
  socket.on("typing", (user) => {
    console.log(`${user} is typing...`);
    io.emit("typing", user);
  });

  // stop typing
  socket.on("stop-typing", (user) => {
    io.emit("stop-typing", user);
  });
});

server.listen(process.env.SERVER_PORT, () => {
  console.log(`Listening on *:${process.env.SERVER_PORT}`);
});
