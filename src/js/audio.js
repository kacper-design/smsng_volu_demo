import gsap from "gsap/gsap-core";
import p5 from "p5";
import * as Tone from "tone";
import { rootId } from "./app";
import { gui } from "./devUI";
p5;

const state = {
  gain: 1,
  mute: true,
};

let players = [];
const removePlayer = (playerId) => {
  players.forEach((player, i) => {
    if (player.owner === playerId) players.splice(i, 1);
  });
  console.log("Players updated");
  console.log(players);
};

const masterGain = new Tone.Gain().set({ gain: state.gain }).toDestination();
const masterChannel = new Tone.Channel(0)
  .set({ mute: state.mute })
  .connect(masterGain);
gui
  .add(state, "gain", 0, 11, 0.01)
  .name("Master Gain")
  .onChange(() => masterGain.set({ gain: state.gain }));
gui
  .add(state, "mute")
  .onFinishChange(() => masterChannel.set({ mute: state.mute }));

const addStream = (stream, streamOwnerId) => {
  console.log("Adding a new audio player");
  let owner;
  console.log(streamOwnerId);
  if (streamOwnerId != null) owner = streamOwnerId;
  else owner = "rootUser";
  players.push(new Player({ _stream: stream, _owner: owner }));
  console.log(players);
};
const notes = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];
const noteHz = {
  C: [16.35, 32.7, 65.41, 130.81, 261.63, 523.25, 1046.5, 2093.0],
  Db: [17.32, 34.65, 69.3, 138.59, 277.18, 554.37, 1108.73, 2217.46],
  D: [18.35, 36.71, 73.42, 146.83, 293.66, 587.33, 1174.66, 2349.32],
  Eb: [19.45, 38.89, 77.78, 155.56, 311.13, 622.25, 1244.51, 2489.02],
  E: [20.6, 41.2, 82.41, 164.81, 329.63, 659.26, 1318.51, 2637.02],
  F: [21.83, 43.65, 87.31, 174.61, 349.23, 698.46, 1396.91, 2793.83],
  Gb: [23.12, 46.25, 92.5, 185.0, 369.99, 739.99, 1479.98, 2959.96],
  G: [24.5, 49.0, 98.0, 196.0, 392.0, 783.99, 1567.98, 3135.96],
  Ab: [25.96, 51.91, 103.83, 207.65, 415.3, 830.61, 1661.22, 3322.44],
  A: [27.5, 55.0, 110.0, 220.0, 440.0, 880.0, 1760.0, 3520.0],
  Bb: [29.14, 58.27, 116.54, 233.08, 466.16, 932.33, 1864.66, 3729.31],
  B: [30.87, 61.74, 123.47, 246.94, 493.88, 987.77, 1975.53, 3951.07],
};

const palettePicker = {
  switch: (newPallete) => (pallete = newPallete),
  0: [
    { h: 31, s: 100, b: 100 },
    { h: 24, s: 100, b: 94 },
    { h: 19, s: 100, b: 94 },
    { h: 4, s: 92, b: 89 },
    { h: 352, s: 100, b: 77 },
    { h: 348, s: 90, b: 93 },
    { h: 49, s: 98, b: 94 },
    { h: 55, s: 97, b: 95 },
    { h: 52, s: 56, b: 97 },
    { h: 49, s: 25, b: 97 },
    { h: 36, s: 69, b: 100 },
    { h: 38, s: 98, b: 94 },
  ],
  1: [
    { h: 208, s: 26, b: 100 },
    { h: 204, s: 61, b: 79 },
    { h: 204, s: 64, b: 69 },
    { h: 201, s: 45, b: 39 },
    { h: 166, s: 70, b: 52 },
    { h: 166, s: 40, b: 86 },
    { h: 166, s: 17, b: 85 },
    { h: 165, s: 7, b: 86 },
    { h: 182, s: 11, b: 68 },
    { h: 35, s: 9, b: 72 },
    { h: 39, s: 8, b: 85 },
    { h: 179, s: 0, b: 94 },
  ],
  2: [
    { h: 0, s: 100, b: 99 },
    { h: 358, s: 89, b: 72 },
    { h: 0, s: 100, b: 43 },
    { h: 0, s: 96, b: 24 },
    { h: 351, s: 91, b: 13 },
    { h: 340, s: 96, b: 70 },
    { h: 358, s: 65, b: 75 },
    { h: 8, s: 38, b: 95 },
    { h: 337, s: 18, b: 91 },
    { h: 29, s: 39, b: 96 },
    { h: 15, s: 52, b: 85 },
    { h: 8, s: 67, b: 92 },
  ],
  3: [
    { h: 72, s: 28, b: 88 },
    { h: 26, s: 58, b: 96 },
    { h: 15, s: 65, b: 94 },
    { h: 355, s: 57, b: 96 },
    { h: 343, s: 48, b: 94 },
    { h: 326, s: 61, b: 88 },
    { h: 238, s: 70, b: 46 },
    { h: 214, s: 67, b: 65 },
    { h: 217, s: 48, b: 94 },
    { h: 180, s: 40, b: 87 },
    { h: 179, s: 98, b: 76 },
    { h: 96, s: 25, b: 76 },
  ],
};

let pallete = palettePicker[0];

const paletteGUI = gui.addFolder("Palettes");

const B_Colors = paletteGUI.addFolder("B_Colors");
palettePicker[0].forEach((color, i) => {
  const folder = B_Colors.addFolder(`Color# ${i}`);
  folder.add(palettePicker[0][i], "h", 0, 360, 1);
  folder.add(palettePicker[0][i], "s", 0, 100, 1);
  folder.add(palettePicker[0][i], "b", 0, 100, 1);
});
const A_Colors = paletteGUI.addFolder("A_Colors");
palettePicker[1].forEach((color, i) => {
  const folder = A_Colors.addFolder(`Color# ${i}`);
  folder.add(palettePicker[1][i], "h", 0, 360, 1);
  folder.add(palettePicker[1][i], "s", 0, 100, 1);
  folder.add(palettePicker[1][i], "b", 0, 100, 1);
});

class Player {
  constructor({ _stream, _owner }) {
    this.owner = _owner;
    this.stream = _stream;
    this.crusher = new Tone.BitCrusher(8);
    this.crusherChannel = new Tone.Channel();
    this.channel = new Tone.Channel(0)
      .connect(masterChannel)
      .chain(this.crusher, this.crusherChannel);
    this.source = Tone.getContext().createMediaStreamSource(this.stream);
    Tone.connect(this.source, this.channel);

    this.fft = new Tone.FFT().set({
      size: 1024,
      normalRange: true,
      smoothing: 0.85,
    });
    this.meter = new Tone.Meter().set({
      smoothing: 0.85,
      normalRange: true,
    });
    this.crusherChannel.connect(this.fft);
    this.crusherChannel.connect(this.meter);
    this.meterMultiplier = 10000;
    this.fftMultiplier = 100000;
    this.volume = this.meter.getValue() * this.meterMultiplier;
    this.buffer = [0];
    this.smoothVolume = 0;
    this.lockColor = false;
    this.color;
    this.xB;
    this.yB;
    //positionVector
    this.x;
    this.y;
    //vectors
    this.position = null; //[x,y]
    this.velocity = null;
    this.mapValues = {
      note: 0,
      volume: 0,
    };
    this.anim = {
      volume: 0,
      note: 0,
      velocityHeading: 0,
    };
    this.fftBrushAngle = 0;
    this.currentFFT;
    this.compactFFT = [];
    this.state = {};
    this.heading;
    this.currentNote = 0;
    this.a1;
    this.a2;
  }

  animateVelocityHead() {
    if (this.heading)
      gsap.to(this.anim, {
        duration: 0.5,
        velocityHeading: this.heading, //this.velocity.heading(),
        ease: "none",
      });
  }

  updateState() {
    this.state.id = rootId;
    this.state.mapValues = this.mapValues;
    this.state.smoothVolume = this.smoothVolume;
    this.state.currentNote = this.currentNote;
    this.state.compactFFT = this.compactFFT;
  }
  getSignal() {
    this.currentFFT = this.fft.getValue();
    this.reduceFFT();
    this.loadBuffer();
    this.smoothVol(sett.gate);
    this.currentNote = this.locateNote();
    if (this.velocity) this.heading = this.velocity.heading();
  }
  valueMapping(p5) {
    p5.push();
    const angle = p5.map(this.currentNote, 0, notes.length, 0, p5.TWO_PI);
    const noteHue = p5.map(angle, 0, p5.TWO_PI, 0, 100);
    this.mapValues.note = noteHue;
    this.mapValues.volume = p5.map(this.anim.volume, -10, sett.maxGate, 0, 100);
    const paletteMapping = Math.round(p5.map(this.anim.note, 0, 100, 0, 11));
    const mappedH = pallete[paletteMapping].h;
    const mappedS = pallete[paletteMapping].s;
    const mappedB = pallete[paletteMapping].b;
    p5.colorMode(p5.HSB, 360, 100, 100);
    this.color = p5.color(mappedH, mappedS, mappedB);
    if (this.mapValues.volume < 10) this.color = p5.color(255);
    p5.pop();
  }
  animateValues() {
    this.animateSmoothing();
    this.animateNote();
    if (this.velocity) this.animateVelocityHead();
  }

  show({ p5, x, y }) {
    if (!this.x) this.x = x;
    else if (this.xB != x) this.xB = x = this.x;
    if (!this.y) this.y = y;
    else if (this.yB != y) this.yB = y = this.y;

    if (this.owner == "rootUser") this.getSignal();
    this.animateValues();

    this.valueMapping(p5);
    if (this.owner == "rootUser") this.updateState();
  }
  showNoteCompass(p5) {
    //console.log(notes.length);
    let color;
    p5.push();
    const sizeMultiplicator = 0.8;
    const size = Math.min(p5.width, p5.height) * sizeMultiplicator;
    const indicatorSize = size * 0.03;
    const faceSize = size * 0.1;
    p5.translate(p5.height * 0.15, p5.height - p5.height * 0.15);
    //p5.translate(p5.width / 2, p5.height * 0.5);

    p5.noStroke();
    p5.fill(255, 100);
    p5.circle(0, 0, faceSize * 1.5);
    let colorPallete = [];

    for (let i = 0; i < notes.length; i++) {
      const angle = p5.map(i, 0, notes.length, 0, p5.TWO_PI);

      // console.log(hues[i] + "  " + i);
      p5.colorMode(p5.HSB, 360, 100, 100);
      color = p5.color(pallete[i].h, pallete[i].s, pallete[i].b);
      colorPallete.push(color);

      p5.push();
      p5.noStroke();
      p5.colorMode(p5.HSB, 360, 100, 100);
      p5.fill(color);
      p5.rotate(angle);

      p5.translate(faceSize / 2 + faceSize / 4, 0);
      //p5.circle(0, 0, faceSize / 3);

      p5.fill(0);
      p5.textAlign(p5.CENTER, p5.CENTER);
      p5.push();
      p5.rotate(-angle);
      // p5.text(`${notes[i]}`, 0, 0);
      p5.pop();
      p5.pop();
    }
    p5.push();
    const increment = p5.TWO_PI / 12;
    p5.rotate(-increment * 1.5);

    for (let i = 0; i < 12; i++) {
      p5.rotate(increment);
      p5.colorMode(p5.HSB, 360, 100, 100);
      p5.stroke(colorPallete[i]);

      //let palleteColor = p5.color(pallete[i], 65, 100);
      //p5.stroke(palleteColor);
      p5.strokeWeight(size * 0.05);

      p5.strokeCap(p5.SQUARE);
      p5.noFill();
      p5.arc(0, 0, faceSize * 2, faceSize * 2, 0, increment);
    }
    p5.pop();
    p5.colorMode(p5.HSB, 360, 100, 100);
    color = p5.color(this.anim.note, this.anim.volume, 100);
    const r = p5.map(this.anim.volume, 0, 150, 1, indicatorSize);
    this.renderBoid(p5, this.color, r);
    p5.pop();
  }

  showCircle(p5, size) {
    p5.push();
    p5.noStroke();
    p5.colorMode(p5.HSB, 360, 100, 100);
    this.color.setAlpha(50);
    p5.fill(this.color);
    p5.circle(this.x, this.y, 20 + 4 * this.anim.volume * size);
    p5.pop();
  }
  createVectors(p5) {
    this.position = p5.createVector(this.x, this.y);
    this.velocity = p5.createVector();
  }
  renderBoid(p5, color, r = 20) {
    p5.push();
    let theta = this.anim.velocityHeading + p5.radians(90);
    p5.fill(255, 100);
    if (color) p5.fill(color);
    p5.colorMode(p5.HSB, 100);
    p5.noStroke();
    p5.push();
    if (theta) p5.rotate(theta);
    p5.beginShape();
    p5.vertex(0, -r * 2);
    p5.vertex(-r, r * 2);
    p5.vertex(r, r * 2);
    p5.endShape(p5.CLOSE);
    p5.pop();
    p5.pop();
  }

  updatePosition(x, y, p5) {
    const remapX = Math.floor(p5.map(x, 0, 1, 0, p5.width));
    const remapY = Math.floor(p5.map(y, 0, 1, 0, p5.height));

    if (this.position === null) this.position = { x: 0, y: 0 };
    this.a1 = gsap.to(this.position, {
      duration: 0.3,
      x: remapX,
    });
    this.a2 = gsap.to(this.position, {
      duration: 0.3,
      y: remapY,
    });
  }

  move(p5, threshold, speed) {
    if (this.position == null) this.createVectors(p5);

    if (this.owner == "rootUser") {
      if (this.position && this.velocity) this.position.add(this.velocity);

      let index = Math.round(p5.map(this.anim.note, 0, 100, 0, 11));
      const angle = p5.map(index, 0, notes.length, 0, p5.TWO_PI);

      this.velocity
        .set(Math.cos(angle), Math.sin(angle))
        .setMag(this.mapValues.volume * speed);

      if (this.mapValues.volume < threshold && this.velocity)
        this.velocity.setMag(0);

      const x = ((this.position.x % p5.width) + p5.width) % p5.width;
      const y = ((this.position.y % p5.height) + p5.height) % p5.height;

      if (this.mapValues.volume > threshold) {
        this.x = x;
        this.y = y;

        const outX = Math.floor(this.position.x);
        const outY = Math.floor(this.position.y);

        this.state.x = p5.map(outX, 0, p5.width, 0, 1);
        this.state.y = p5.map(outY, 0, p5.height, 0, 1);
      }
    } else {
      const x = ((this.position.x % p5.width) + p5.width) % p5.width;
      const y = ((this.position.y % p5.height) + p5.height) % p5.height;
      if (this.mapValues.volume > threshold) {
        this.x = x;
        this.y = y;
      }
    }
  }
  showNote(p5, x, y) {
    p5.push();
    p5.textAlign(p5.CENTER, p5.CENTER);
    p5.textFont("Ubuntu Mono");
    p5.textSize(this.anim.volume * 0.2);
    p5.fill(0);
    p5.text(this.noteEstimate(), this.x, this.y + this.anim.volume * 2.3);
    p5.pop();
  }
  locateNote() {
    const currentNote = this.noteEstimate()[0];
    const noteIndex = notes.indexOf(currentNote);
    return noteIndex;
  }
  reduceFFT() {
    let reducedFFT = [];
    const interval = 3;
    reducedFFT.push(this.currentFFT[0]);
    this.currentFFT.forEach((value, i) => {
      if (i % interval == 0) reducedFFT.push(value);
    });
    this.compactFFT = reducedFFT;
  }

  visualizeFft(p5, sizeA, sizeB) {
    this.fftBrushAngle = this.fftBrushAngle + 5;
    const x = this.x;
    const y = this.y;
    p5.push();

    p5.colorMode(p5.HSB, 360, 100, 100);
    this.color.setAlpha(50);
    p5.stroke(this.color);
    const size = 0.5;
    p5.strokeWeight(this.anim.volume * sizeB * size);
    const radius = this.anim.volume * sizeA;
    p5.translate(x, y);
    p5.rotate(p5.map(this.fftBrushAngle % 360, 0, 360, 0, p5.TWO_PI));
    const buffer = this.compactFFT;

    for (let i = 0; i < buffer.length; i++) {
      p5.push();
      p5.rotate(p5.PI);
      let angle = p5.map(i, 0, buffer.length, 0, p5.TWO_PI);
      p5.rotate(angle);
      let db = buffer[i] * this.fftMultiplier;
      if (db < 0.001) db = 0;
      let Y = p5.map(db, 0, 2, 0, radius);
      if (Y > radius * 2) Y = radius * 2;
      p5.point(0, Y);
      p5.pop();
    }
    p5.pop();
  }
  noteEstimate() {
    const hzPeak = this.peakFreq();
    const Hz = hzPeak.freq;
    let bestFit = 9999;
    let estimatedNote = ["A", 1];
    //compute the similarity of the input note and the reference note matrix
    notes.forEach((element) => {
      noteHz[element].forEach((n, index) => {
        let deviation = Math.abs(n - Hz);
        if (bestFit > deviation) {
          bestFit = deviation;
          estimatedNote[0] = element;
          estimatedNote[1] = index;
        }
      });
    });
    return estimatedNote;
  }
  peakFreq() {
    const FFT = this.currentFFT; //this.fft.getValue();
    const peakIndex = FFT.indexOf(Math.max(...FFT));
    const hzMultiplier = 440 / 38;
    const Hz = Math.floor(peakIndex * hzMultiplier);
    return { index: peakIndex, freq: Hz };
  }
  animateSmoothing() {
    gsap.to(this.anim, {
      duration: 0.3,
      volume: this.smoothVolume,
      ease: "sine.out",
    });
  }
  animateNote() {
    gsap.to(this.anim, {
      duration: 0.5,
      note: this.mapValues.note,
      ease: "none",
    });
  }
  smoothVol(gate = false) {
    this.smoothVolume = Math.round(bufferAvg(this.buffer));
    if (gate) {
      if (this.smoothVolume < sett.minGate) this.smoothVolume = 0;
      else if (this.smoothVolume > sett.maxGate)
        this.smoothVolume = sett.maxGate;
    }
  }
  loadBuffer() {
    this.volume = this.meter.getValue() * this.meterMultiplier;
    this.buffer.unshift(Math.round(this.volume));
    if (this.buffer.length > sett.bufferSize) this.buffer.pop();
  }
}

const sett = {
  //moving avarage and gate cut settings
  bufferSize: 15,
  gate: true,
  minGate: 5,
  maxGate: 150,
};

const bufferAvg = (buffer) => buffer.reduce((a, b) => a + b, 0) / buffer.length;

export { addStream, players, removePlayer, palettePicker };
