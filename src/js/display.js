import p5 from "p5";
import { roomId, rootId, socket } from "./app";
import { palettePicker, players } from "./audio";
import { gui } from "./devUI";

const presets = {
  0: {
    bcgOpacity: 0,
    showNote: false,
    move: true,
    fftViz: true,
    fftSizeA: 0,
    fftSizeB: 0.53,
    showCircle: true,
    circleSize: 0.3,
    threshold: 25,
    speed: 0.4,
    bcgColor: [0, 0, 0],
    lockColor: false,
    currentPalette: 0,
  },
  1: {
    bcgOpacity: 49,
    showNote: false,
    move: true,
    fftViz: true,
    fftSizeA: 0.2,
    fftSizeB: 0.88,
    showCircle: true,
    circleSize: 0.05,
    threshold: 33,
    speed: 0.05,
    bcgColor: [0, 0, 0],
    lockColor: false,
    currentPalette: 1,
  },
  2: {
    bcgOpacity: 0,
    showNote: false,
    move: true,
    fftViz: true,
    fftSizeA: 0.81,
    fftSizeB: 0.17,
    showCircle: true,
    circleSize: 0.1,
    threshold: 23,
    speed: 0.15,
    bcgColor: [0, 0, 0],
    lockColor: false,
    currentPalette: 2,
  },
  3: {
    bcgOpacity: 0,
    showNote: false,
    move: true,
    fftViz: true,
    fftSizeA: 0,
    fftSizeB: 0.26,
    showCircle: true,
    circleSize: 0.05,
    threshold: 6,
    speed: 0.15,
    bcgColor: [0, 0, 0],
    lockColor: false,
    currentPalette: 3,
  },
};
const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const mode = urlParams.get("mode");

console.log(mode);
console.log(presets[mode]);

const params = {
  bcgOpacity: 4,
  showNote: false,
  move: true,
  fftViz: true,
  fftSizeA: 0.2,
  fftSizeB: 0.45,
  showCircle: true,
  circleSize: 0.1,
  threshold: 25,
  speed: 0.15,
  bcgColor: [0, 0, 0],
  lockColor: false,
  currentPalette: 0,
};
const reportRootState = () => {
  if (players && players[0]) {
    const state = players[0].state;
    if (socket) socket.emit(`stateUpdate`, { state, roomId, rootId });
  }
};
setInterval(reportRootState, 50);
let gP5;
const handleStateUpdate = ({ state }) => {
  let ctxUser = players.find((player) => player.owner == state.id);
  if (ctxUser) {
    if (gP5) ctxUser.updatePosition(state.x, state.y, gP5);
    ctxUser.mapValues = state.mapValues;
    ctxUser.smoothVolume = state.smoothVolume;
    ctxUser.compactFFT = state.compactFFT;
    ctxUser.currentNote = state.currentNote;
  }
};
const reportParamsChange = () => {
  socket.emit(`paramsChange`, { params, roomId });
};
const handleParamsChange = ({ _params }) => {
  for (const [key] of Object.entries(params)) params[key] = _params[key];
  palettePicker.switch(palettePicker[params.currentPalette]);
};
if (palettePicker[mode] && presets[mode])
  handleParamsChange({ _params: presets[mode] });

const initGui = () => {
  gui
    .add(params, "currentPalette", 0, 2, 1)
    .onChange(() => palettePicker.switch(palettePicker[params.currentPalette]))
    .onFinishChange(reportParamsChange);
  gui.add(params, "bcgOpacity", 0, 255, 1).onChange(reportParamsChange);
  gui.add(params, "speed", 0, 1, 0.05).onChange(reportParamsChange);
  gui
    .add(params, "threshold", 0, 100, 1)
    .name("Movement threshold")
    .onChange(reportParamsChange);
  gui.add(params, "fftViz").onChange(reportParamsChange);
  gui.add(params, "fftSizeA", 0, 1, 0.01).onChange(reportParamsChange);
  gui.add(params, "fftSizeB", 0, 1, 0.01).onChange(reportParamsChange);

  gui.add(params, "showNote").onChange(reportParamsChange);
  gui.add(params, "circleSize", 0, 1, 0.05).onChange(reportParamsChange);
  gui.add(params, "showCircle").onChange(reportParamsChange);
  gui.add(params, "move").onChange(reportParamsChange);

  //gui.add(params, "lockColor");
  gui.close();
};
initGui();
const displayInstance = () => {
  let canvasDiv;
  canvasDiv = document.createElement("div");
  canvasDiv.className = "masterCanvasDiv";
  canvasDiv.id = "masterCanvasDiv";
  document.body.appendChild(canvasDiv);
  const display = (p5) => {
    p5.setup = () => {
      gP5 = p5;
      let cnv = p5
        .createCanvas(p5.windowWidth, p5.windowHeight)
        .id("MasterCanvas")
        .parent(canvasDiv);
    };
    p5.draw = () => {
      let others = players.length > 1;

      let x = p5.width / 2;
      let y = p5.height / 2;
      const c = [...params.bcgColor];
      c.push(params.bcgOpacity);
      p5.background(200, 200, 200, params.bcgOpacity);

      if (players) {
        players.forEach((player) => {
          if (player.owner !== "rootUser") others = true;
          if (!others) {
            player.lockColor = params.lockColor;
            player.show({ p5: p5, x: x, y: y });

            if (params.showNote) player.showNote(p5, x, y);
            if (params.showCircle) player.showCircle(p5, params.circleSize);

            if (params.fftViz)
              player.visualizeFft(p5, params.fftSizeA, params.fftSizeB);
            if (params.move) player.move(p5, params.threshold, params.speed);
          } else if (others === true) {
            if (player.owner !== "rootUser") {
              player.lockColor = params.lockColor;
              //player.show({ p5: p5, x: x - x / 2, y: y });
              player.show({ p5: p5, x: x, y: y });

              if (params.showNote) player.showNote(p5, x - x / 2, y);
              if (params.showCircle) player.showCircle(p5, params.circleSize);
              if (params.fftViz)
                player.visualizeFft(p5, params.fftSizeA, params.fftSizeB);
              if (params.move) player.move(p5, params.threshold, params.speed);
            } else {
              player.lockColor = params.lockColor;
              //player.show({ p5: p5, x: x + x / 2, y: y });
              player.show({ p5: p5, x: x, y: y });
              if (params.showNote) player.showNote(p5, x + x / 2, y);
              if (params.showCircle) player.showCircle(p5, params.circleSize);
              if (params.fftViz)
                player.visualizeFft(p5, params.fftSizeA, params.fftSizeB);
              if (params.move) player.move(p5, params.threshold, params.speed);
            }
          }
        });
        if (players[0]) players[0].showNoteCompass(p5);
      }
    };
    p5.windowResized = () =>
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight, true);
  };
  new p5(display);
};

export { displayInstance, handleParamsChange, handleStateUpdate };
