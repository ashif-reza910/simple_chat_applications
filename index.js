const express = require("express");
const cors = require("cors");

const path = require("path");

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

// connection alive
io.on("connection", onConnected);
let socketsConected = new Set();

function onConnected(socket) {
  socket.on("user:add", (name) => {
    socket_id = socket.id;
    socketsConected.add({ socketId: socket_id, name: name });
    console.log("a new user connected ", socket_id, name);

    const socketsArray = [...socketsConected];
    io.emit("total:connected", socketsArray);
  });

  socket.on("message:send", (data) => {
    socket.broadcast.emit("message:recieve", data);
  });

  socket.on("disconnect", () => {
    const socketsArray = [...socketsConected];
    socketsArray.forEach((entry) => {
      if (entry.socketId === socket.id) {
        socketsConected.delete(entry);
      }
    });
    io.emit("total:connected", socketsArray);
  });

  socket.on("feedback:send", (data) => {
    socket.broadcast.emit("feedback:recieved", data);
  });
}
