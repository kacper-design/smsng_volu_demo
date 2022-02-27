const express = require("express");
const app = express();
const fs = require("fs");
const { PeerServer } = require("peer");

const dev = true; // !!!!!!!!!!!!!!!!!!!!!!!!!!FALSE for deployment
let sslOptions;
if (!dev)
  sslOptions = {
    key: fs.readFileSync(
      "/etc/letsencrypt/live/voice-paint.ixd-prototypes.com/privkey.pem",
      "utf8"
    ),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/voice-paint.ixd-prototypes.com/fullchain.pem",
      "utf8"
    ),
  };
else sslOptions = {};
const peerServer = PeerServer(
  {
    port: 3001,
    secured: true, //uncomment for deployment
    proxied: true, //
    ssl: sslOptions, //
  },
  () => console.log("Running peer server on port 3001")
);

const listen = () => {
  console.log(`Server listening...connectinKey: ${server._connectionKey}`);
};

const port = process.env.PORT;
let server = app.listen(port || 3000, listen);

const io = require("socket.io")(server);
const { v4: uuidV4 } = require("uuid");

app.set("view engine", "ejs");
app.use(express.static("public"));

app.get("/paint/", (req, res) => {
  res.redirect(`/paint/${uuidV4()}`);
});

app.get("/paint/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) => {
    socket.join(roomId);
    const socketID = socket.id;
    socket.to(roomId).broadcast.emit("user-connected", { userId, socketID });
    //socket.to(roomId).broadcast.emit("user-connected", socket.id);

    socket.on("paramsChange", ({ params, roomId }) => {
      const _params = params;
      socket.to(roomId).broadcast.emit("paramsChange", { _params });
    });

    socket.on("stateUpdate", ({ state, roomId, rootId }) => {
      const userId = rootId;
      socket.to(roomId).broadcast.emit("stateUpdate", { state, userId });
      //io.in(roomId).emit("stateUpdate", { state, userId }); //including the sender
    });

    socket.on("disconnect", () => {
      socket.to(roomId).broadcast.emit("user-disconnected", userId);
    });
  });
});
