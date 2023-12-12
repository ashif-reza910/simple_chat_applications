const express = require("express");
const cors = require("cors");

const path = require("path");
const {
  userJoin,
  getRoomUsers,
  userLeave,
  getCurrentUser,
} = require("./public/utils/users");
const { formatMessage } = require("./public/utils/message");

const app = express();
const port = process.env.PORT || 5000;

// cors origin
app.use(
  cors({
    origin: "*",
  })
);

const server = app.listen(port, () => {
  console.log("server is running at port" + port);
});

const io = require("socket.io")(server);

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "public", "group.html");
  res.sendFile(filePath);
});

// create socket - attach with current socket
io.on("connection", onConnected);
const botName = "ChatCord Bot";

function onConnected(socket) {
  console.log("a new user connected ", socket.id);

  socket.on("joinRoom", ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);

    // Welcome current user
    socket.emit("message", formatMessage(botName, "Welcome to ChatCord!"));

    // io.emit("total:connected", getRoomUsers);

    // Broadcast when a user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        formatMessage(botName, `${user.username} has joined the chat`)
      );

    // Send users and room info
    io.to(user.room).emit("roomUsers", {
      room: user.room,
      users: getRoomUsers(user.room),
    });

    // Listen for chatMessage
    socket.on("chatMessage", (msg) => {
      const user = getCurrentUser(socket.id);
      socket.broadcast
        .to(user.room)
        .emit("message", formatMessage(user.username, msg));
    });

    // feedback
    socket.on("feedback:send", (data) => {
      socket.broadcast.to(user.room).emit("feedback:recieved", data);
    });

    // Runs when client disconnects
    socket.on("disconnect", () => {
      const user = userLeave(socket.id);

      if (user) {
        io.to(user.room).emit(
          "message",
          formatMessage(botName, `${user.username} has left the chat`)
        );

        // Send users and room info
        io.to(user.room).emit("roomUsers", {
          room: user.room,
          users: getRoomUsers(user.room),
        });
      }
    });
  });
}
