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
    console.log(message);
    io.emit("message", message);
  });
});

server.listen(3001, () => {
  console.log("listerning on *:3001");
});
