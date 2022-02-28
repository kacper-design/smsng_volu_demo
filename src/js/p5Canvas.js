import p5 from "p5";
import { roomId, rootId, socket, mode } from "./app";
import { players } from "./players";


let objs = [];
let objsNum = 360;
const noiseScale = 0.01;
let R;
let maxR;
let t = 0;
let nt = 0;
let nR = 0;
let nTheta = 1000;
const palette = ["#ACDEED55", "#EAD5E855", "#84C0E755", "#38439955"];
const drawContent = (p5) => {
  console.log(123)

  let R = p5.map(p5.noise(nt * 0.01, nR), 0, 1, 0, maxR);
  let t = p5.map(p5.noise(nt * 0.001, nTheta), 0, 1, -360, 360);
  let x = R * p5.cos(t) + p5.width / 2;
  let y = R * p5.sin(t) + p5.height / 2;
   objs.push(new Obj(x, y,p5));

  if (p5.mouseIsPressed) {
    objs.push(new Obj(p5.mouseX, p5.mouseY, p5));
  }

  for (let i = 0; i < objs.length; i++) {
    objs[i].move(p5);

    objs[i].display(p5);
  }

  for (let j = objs.length - 1; j >= 0; j--) {
    if (objs[j].isFinished(p5)) {
      objs.splice(j, 1);
    }
  }

  // t++;
  nt++;
};

let canvasDiv;
let p5CanvasInstance;
const initP5CanvasInstance = () => {
  initCanvasDiv();
  const display = (p5) => {
    p5.setup = () => {
      const cnv = p5
        .createCanvas(p5.windowWidth, p5.windowHeight)
        .id("MasterCanvas")
        .parent(canvasDiv);



      p5.angleMode(p5.DEGREES);
      p5.noStroke();
      maxR = p5.max(p5.width, p5.height) * 0.45;
      p5.background("#F5F4FD");
    };
    p5.draw = () => drawContent(p5);

    p5.windowResized = () =>
      p5.resizeCanvas(p5.windowWidth, p5.windowHeight, true);
  };
  p5CanvasInstance = new p5(display);
};

const initCanvasDiv = () => {
  canvasDiv = document.createElement("div");
  canvasDiv.className = "masterCanvasDiv";
  canvasDiv.id = "masterCanvasDiv";
  document.body.appendChild(canvasDiv);
};

class Obj {
  constructor(ox, oy,p5) {
    this.init(ox, oy,p5);
  }

  init(ox, oy,p5) {
    this.vel = p5.createVector(0, 0);
    this.pos = p5.createVector(ox, oy);
    this.t = p5.random(0, noiseScale);
    this.lifeMax = p5.random(20, 50);
    this.life = this.lifeMax;
    this.step = p5.random(0.1, 0.5);
    this.dMax = p5.random(10) >= 5 ? 10 : 30;
    this.d = this.dMax;
    this.c = p5.color(p5.random(palette));
  }

  move(p5) {
    let theta = p5.map(
      p5.noise(this.pos.x * noiseScale, this.pos.y * noiseScale, this.t),
      0,
      1,
      -360,
      360
    );
    this.vel.x = p5.cos(theta);
    this.vel.y = p5.sin(theta);
    this.pos.add(this.vel);
  }

  isFinished(p5) {
    this.life -= this.step;
    this.d = p5.map(this.life, 0, this.lifeMax, 0, this.dMax);
    if (this.life < 0) {
      return true;
    } else {
      return false;
    }
  }

  display(p5) {
    p5.fill(this.c);

    p5.circle(this.pos.x, this.pos.y, this.d);
  }
}

function func(t, num) {
  let a = 360 / num;
  let A = cos(a);
  let b = acos(cos(num * t));
  let B = cos(a - b / num);

  return A / B;
}

export { initP5CanvasInstance };
