import { addStream, removePlayer } from "./audio";
import {
  displayInstance,
  handleParamsChange,
  handleStateUpdate,
} from "./display";

const socket = io("/");
let roomId;
let rootId;
const videoGrid = document.getElementById("video-grid");
const myPeer = new Peer(undefined, {
  //host: "/", //----
  debug: 2,
  secure: true, //----//----// uncomment for deployment
  initiator: true, // uncomment for deployment
  //port: "3001", //----
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
});
console.log(myPeer);
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: false, //true,
    audio: true,
  })
  .then((stream) => {
    console.log(`My stream ID is: ${stream.id}`);
    console.log(`My client ID is: ${myPeer.id}`);
    rootId = myPeer.id;
    const persist = setInterval(() => {
      rootId = myPeer.id;
      if (rootId != null) {
        console.log("stop");
        clearInterval(persist);
      }
      console.log(rootId);
    }, 500);
    addVideoStream(myVideo, stream);
    displayInstance(); //P5 canvas

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
      console.log("SOCKET.IO: user-connected!");
      console.log("users id: " + socketID);
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

socket.on("paramsChange", ({ _params }) => handleParamsChange({ _params }));
socket.on("stateUpdate", ({ state, userId }) =>
  handleStateUpdate({ state, userId })
);

myPeer.on("open", (id) => {
  roomId = ROOM_ID;
  socket.emit("join-room", ROOM_ID, id);
  console.log(`Room ID: ${ROOM_ID}`);
});

function connectToNewUser(userId, stream, socketID) {
  console.log("SOCKET ID: " + socketID);

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
      addVideoStream(video, userVideoStream, userId);
    });
    call.on("close", () => {
      video.remove();
    });

    peers[userId] = call;
    console.log(peers);
  }
}

function addVideoStream(video, stream, peer, socketID) {
  console.log(peer);
  let streamOwnerId;
  if (peer) streamOwnerId = peer;
  video.srcObject = stream;
  addStream(stream, streamOwnerId);
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  //videoGrid.append(video);
}
export { socket, roomId, rootId };
