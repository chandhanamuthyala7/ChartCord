const path = require("path");
const http = require("http");
const express = require("express");
const socketio = require("socket.io");

// ✅ DB
const connectDB = require("./config/db");
const Message = require("./models/Message");

connectDB();

const formatMessage = require("./utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers,
} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Static folder
app.use(express.static(path.join(__dirname, "public")));

const botName = "ChatCord Bot";

io.on("connection", (socket) => {
  socket.on("joinRoom", async ({ username, room }) => {
  if (!username || !room) return;
  
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    // ✅ Load old messages from DB
    const messages = await Message.find({ room: user.room });

    messages.forEach((msg) => {
      socket.emit("message", msg);
    });

    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  });

  // ✅ Save messages
  socket.on("chatMessage", async (msg) => {
    const user = getCurrentUser(socket.id);

    if (user) {
      const message = formatMessage(user.username, msg);

      // Save to DB
      await Message.create({
        username: message.username,
        text: message.text,
        room: user.room,
        time: message.time,
      });

      io.to(user.room).emit("message", message);
    }
  });

  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        "message",
        formatMessage(botName, `${user.username} has left the chat`)
      );

      io.to(user.room).emit("roomUsers", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  });
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));