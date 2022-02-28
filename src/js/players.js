import gsap from "gsap/gsap-core";
import * as Tone from "tone";
import { gui } from "./devUI";
import { roomId, rootId, socket, mode } from ".";

const state = {
  gain: 1,
  mute: true,
};

const masterGain = new Tone.Gain().set({ gain: state.gain }).toDestination();
const masterChannel = new Tone.Channel(0)
  .set({ mute: state.mute })
  .connect(masterGain);

const players = [];
const removePlayer = (playerId) => {
  players.forEach((player, i) => {
    if (player.owner === playerId) players.splice(i, 1);
  });
  console.log("Players updated");
  console.log(players);
};

const addPlayer = (stream, streamOwnerId, root) => {
  console.log("Adding a new audio player");
  console.log(streamOwnerId);
  players.push(
    new Player({ _stream: stream, _owner: streamOwnerId, _root: root })
  );

  console.log(players);
};

class Player {
  constructor({ _stream, _owner, _root }) {
    this.owner = _owner;
    this.stream = _stream;
    this.root = _root;

    this.crusher = new Tone.BitCrusher(8);
    this.crusherChannel = new Tone.Channel();
    this.channel = new Tone.Channel(0)
      .connect(masterChannel)
      .chain(this.crusher, this.crusherChannel);
    this.source = Tone.getContext().createMediaStreamSource(this.stream);
    Tone.connect(this.source, this.channel);
    this.state = {};
  }

  updateState() {
    this.state.id = rootId;
  }
}

const reportRootState = () => {
  if (players && players[0]) {
    const state = players[0].state;
    if (socket) socket.emit(`stateUpdate`, { state, roomId, rootId });
  }
};
setInterval(reportRootState, 50);

//GUI
gui
  .add(state, "gain", 0, 11, 0.01)
  .name("Master Gain")
  .onChange(() => masterGain.set({ gain: state.gain }));
gui
  .add(state, "mute")
  .onFinishChange(() => masterChannel.set({ mute: state.mute }));

const bufferAvg = (buffer) => buffer.reduce((a, b) => a + b, 0) / buffer.length;

export { addPlayer, players, removePlayer };
