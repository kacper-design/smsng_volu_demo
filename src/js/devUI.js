import * as dat from "dat.gui";
import { reactTargetDiv, videoGrid } from ".";
import { bcgCanvasDiv } from "./p5Canvas";
import { threeCanvasRender, threeDivOrbitControl } from "./threeCanvas";

const state = {
  backgroundState: true,
  threeCanvasState: true,
  threeOrbControlState: true,
  videoGridState: true,
  reactDivState: true
};

const gui = new dat.GUI();
gui.close();
const canvasControls = gui.addFolder("Convas Controls");

canvasControls
  .add(state, "videoGridState")
  .onFinishChange(() =>
    videoGrid
      ? (videoGrid.style.display = state.videoGridState ? "grid" : "none")
      : null
  );

  canvasControls
  .add(state, "reactDivState")
  .onFinishChange(() => toggleDiv(reactTargetDiv, state.reactDivState));

canvasControls
  .add(state, "backgroundState")
  .onFinishChange(() => toggleDiv(bcgCanvasDiv, state.backgroundState));

canvasControls
  .add(state, "threeCanvasState")
  .onFinishChange(() => toggleDiv(threeCanvasRender, state.threeCanvasState));

canvasControls
  .add(state, "threeOrbControlState")
  .onFinishChange(() =>
    toggleDiv(threeDivOrbitControl, state.threeOrbControlState)
  );

const toggleDiv = (targetDiv, state = true) =>
  targetDiv ? (targetDiv.style.display = state ? "block" : "none") : null;

export { gui };
