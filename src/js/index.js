



import { addPlayer, removePlayer, players } from "./players";
import { initP5CanvasInstance } from "./p5Canvas";
import { initThreeCanvas } from "./threeCanvas";
import React from "react";
import ReactDOM from "react-dom";


const reactTargetDiv = document.createElement("div");
ReactDOM.render(
  <React.StrictMode>
  React is compiling
  </React.StrictMode>,
  reactTargetDiv
);

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const mode = urlParams.get("mode");

let videoGrid;
const initVideoGridDiv = () => {
  videoGrid = document.createElement("div");
  videoGrid.id = "video-grid";
  document.body.appendChild(videoGrid);
};

initVideoGridDiv();

const socket = io("/");
let roomId;

const myPeerOptions = {
  host: "/", //----
  debug: 2,
  //secure: true, //----//----// uncomment for deployment
  //initiator: true, // uncomment for deployment
  port: "3001", //----
  config: {
    iceServers: [
      { url: "stun:stun1.l.google.com:19302?transport=udp" }, //stun.nextcloud.com:443
      //{ url: "stun:stun2.l.google.com:19302" },
      {
        url: "turn:numb.viagenie.ca",
        credential: "muazkh",
        username: "webrtc@live.com",
      },
    ],
  },
};
const myPeer = new Peer(undefined, myPeerOptions);
const rootId = myPeer ? myPeer.id : null;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};

navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    console.log(`My stream ID is: ${stream.id}`);
    console.log(`My client ID is: ${myPeer.id}`);

    addVideoStream(myVideo, stream);
    addPlayer(stream, myPeer.id, "root");

    initThreeCanvas();
    initP5CanvasInstance(); //P5 canvas

    myPeer.on("call", (call) => {
      try {
        call.answer(stream);
      } catch (error) {
        console.log("Error while trying to answear the call");
        console.log(error);
      }
      const video = document.createElement("video");
      call.on("close", (value) => {
        console.log("closed");
      });

      call.on("stream", (userVideoStream) => {
        setTimeout(connectToNewUser, 1500, call.peer, userVideoStream, "none_");
      });
    });

    socket.on("user-connected", ({ userId, socketID }) => {
      console.log(`User is trying to connect! ID: ${socketID}`);
      setTimeout(connectToNewUser, 1500, userId, stream, socketID);
    });
  });

socket.on("user-disconnected", (userId) => {
  console.log("user disconnected " + userId);
  removePlayer(userId);
  if (peers[userId]) {
    peers[userId].close();
    delete peers[userId];
  }
});

//socket.on("paramsChange", ({ _params }) => handleParamsChange({ _params }));
// socket.on("stateUpdate", ({ state, userId }) =>
//   handleStateUpdate({ state, userId })
// );

myPeer.on("open", (id) => {
  roomId = ROOM_ID;
  socket.emit("join-room", ROOM_ID, id);
  console.log(`Room is open. Room ID: ${ROOM_ID}`);
});

const connectToNewUser = (userId, stream, socketID) => {
  console.log(`Connecting new user. ID:${socketID}`);

  if (!peers[userId]) {
    console.log(`connecting to the new user: ${userId}`);
    let call;
    try {
      call = myPeer.call(userId, stream);
    } catch (error) {
      console.log("Error while calling myPeer");
      console.log(error);
    }

    const video = document.createElement("video");
    video.muted = false; //change here

    call.on("stream", (userVideoStream) => {
      addVideoStream(video, userVideoStream);
      const duplicate = players.find((player) => player.owner == userId);
      !duplicate ? addPlayer(video.srcObject, userId) : null;
    });

    call.on("close", () => {
      video.remove();
    });

    peers[userId] = call;
    console.log(`Peers updated:  `);
    console.log(peers);
  }
};

const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => video.play());
  videoGrid.append(video);
};

export { socket, roomId, rootId, mode, myVideo, videoGrid, reactTargetDiv };
