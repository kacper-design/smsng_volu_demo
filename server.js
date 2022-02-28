const express = require("express");
const app = express();
const fs = require("fs");
const { PeerServer } = require("peer");
const { v4: uuidV4 } = require("uuid");

const dev = true; // !!FALSE for deployment
const sslOptions = !dev
  ? {
      key: fs.readFileSync(
        "/etc/letsencrypt/live/voice-paint.ixd-prototypes.com/privkey.pem",
        "utf8"
      ),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/voice-paint.ixd-prototypes.com/fullchain.pem",
        "utf8"
      ),
    }
  : {};

const port = process.env.PORT || 3000;
const peerPort = 3001;

let server = app.listen(port, () => {
  console.log(`Running server on port ${port}`);
});

const peerServer = PeerServer(
  {
    port: peerPort,
    //secured: true, //uncomment for deployment
    //proxied: true, //
    ssl: sslOptions, //
  },
  () => console.log(`Running peer server on port ${peerPort}`)
);

const io = require("socket.io")(server);

app.set("view engine", "ejs");
app.use(express.static("public"));

//ROUTES
app.get("/demo/", (req, res) => {
  res.redirect(`/demo/${uuidV4()}`);
});

app.get("/demo/:room", (req, res) => {
  res.render("room", { roomId: req.params.room });
});


const handleJoined = (roomId, userId, socket) => {
  socket.join(roomId);
  const socketID = socket.id;

  socket.to(roomId).emit("user-connected", { userId, socketID });

  socket.on("paramsChange", ({ params, roomId }) => {
    const _params = params;
    socket.to(roomId).emit("paramsChange", { _params });
  });

  socket.on("stateUpdate", ({ state, roomId, rootId }) => {
    const userId = rootId;
    socket.to(roomId).emit("stateUpdate", { state, userId });
  });

  socket.on("disconnect", () => {
    socket.to(roomId).emit("user-disconnected", userId);
  });
};


io.on("connection", (socket) => {
  socket.on("join-room", (roomId, userId) =>
    handleJoined(roomId, userId, socket)
  );
});
