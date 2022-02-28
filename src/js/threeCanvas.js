import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import { myVideo } from ".";

// init
let camera, scene, texture, geometry, material, mesh, renderer, controls;
let threeCanvasRender;
const rendererOptions = { antialias: true, alpha: true };

const initThreeCanvas = () => {
  camera = new THREE.PerspectiveCamera(
    70,
    window.innerWidth / window.innerHeight,
    0.01,
    10
  );

  camera.position.z = 1;

  scene = new THREE.Scene();
  texture = new THREE.VideoTexture(myVideo);

  const light = new THREE.AmbientLight(0xffffff); // soft white light
  scene.add(light);

  geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
  material = new THREE.MeshLambertMaterial({ map: texture });

  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);

  renderer = new THREE.WebGLRenderer(rendererOptions);
  threeCanvasRender = renderer.domElement;
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(threeCanvasRender);
 

  renderer.domElement.classList.add("threeDiv");


  initDivOrbitControl();
  controls = new OrbitControls(camera, threeDivOrbitControl);

 
  controls.update();
  renderer.setAnimationLoop(animate);

};
// animation

const animate = (time) => {
  //mesh.rotation.x = time / 3500;
  //mesh.rotation.y = time / 3500;
  //console.log(controls)
  //controls.update();
  //requestAnimationFrame(animate);

  renderer.render(scene, camera);
};

let threeDivOrbitControl;
const initDivOrbitControl = () => {
  threeDivOrbitControl = document.createElement("div");
  threeDivOrbitControl.className = "three-div-orbit-control";
  threeDivOrbitControl.id = "three-div-orbit-control";
  document.body.appendChild(threeDivOrbitControl);
};

export { initThreeCanvas,threeCanvasRender,threeDivOrbitControl };
