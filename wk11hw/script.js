var cols, rows;
var scl = 20;
var zoff = 0;
var particles = [];
var flowfield;
var i = 0;
var bgcolor;
var portName = '/dev/tty.usbmodem11201'
var pg
var photocellValue = 600

function setup() {
  createCanvas(600, 800);

  // Perlin noise code reference: The coding Train. https://www.youtube.com/watch?v=BjoM9oKOAKY&t=1270s.
  cols = floor(width / scl);
  rows = floor(height / scl);

  //create a flow field
  flowfield = new Array(cols * rows);

  for (var i = 0; i < 2000; i++) {
    particles[i] = new Particle();
  }

  //set an original background color to check if the code is working
  bgcolor = color(255, 165, 0);
  background(bgcolor);

  //input the photocell value (from codes learnt in class)
  serial = new p5.SerialPort();
  serial.onList(gotList);
  serial.list();
  serial.openPort(portName);
  serial.onData(gotData);

  //change the background color by creating graphics and move the new bgs to a different canvas. 
  pg = createGraphics(width, height);
  pg.background(255, 0)
}

function draw() {
  updateBackgroundColor();

  //create perlin noise
  var yoff = 0;
  for (var y = 0; y < rows; y++) {
    var xoff = 0;
    for (var x = 0; x < cols; x++) {
      var index = x + y * cols;
      var angle = noise(xoff, yoff, zoff) * TWO_PI * 2;
      var v = p5.Vector.fromAngle(angle);
      v.setMag(1);
      flowfield[index] = v;
      xoff += 0.1;
    }
    yoff += 0.1;
  }
  zoff += 0.01;

  for (var i = 0; i < particles.length; i++) {
    particles[i].follow(flowfield);
    particles[i].update();
    particles[i].edges();
    particles[i].show();
  }

  image(pg, 0, 0)

  push();

  // Set the start and end colors for the sun
  var sunsetOrange = color(230, 50, 0);
  var lightYellow = color(255, 255, 226);

  // Map the photocell value
  var lerpFactor = map(photocellValue, 0, 1023, 0, 1);
  var gradientColor = lerpColor(sunsetOrange, lightYellow, lerpFactor);

  // Apply radial gradient to ellipse. reference: https://editor.p5js.org/biggerpicture/sketches/POg_IV6t2
  radialGradient(width / 2 - 30, height / 2 - 30, 0,
    width / 2 + 50, height / 2 + 50, 130,
    gradientColor, color(255));
  noStroke();
  i = i + 0.1;
  if (i < 80) {
    ellipse(width / 2, height / 2, i, i);
  } else {
    ellipse(width / 2, height / 2, 80, 80);
  }
  pop();

}

function gotList(ports) {
  for (var a = 0; a < ports.length; a++) {
    console.log(ports[i])
  }
}

function gotData() {
  photocellValue = serial.readLine();
  console.log("Photocell Value: " + photocellValue);
}

//update bg color
function updateBackgroundColor() {
  var colorStart = color(255, 165, 0); // Dark Orange
  var colorMiddle = color(255, 192, 203); // Pink
  var colorEnd = color(135, 206, 250); // Light Blue

  var bgColor;

  if (photocellValue < 512) {
    var lerpFactor = map(photocellValue, 0, 511, 0, 1);
    bgColor = lerpColor(colorStart, colorMiddle, lerpFactor);
  } else {
    var lerpFactor = map(photocellValue, 512, 1023, 0, 1);
    bgColor = lerpColor(colorMiddle, colorEnd, lerpFactor);
  }

  background(bgColor);
}

// code reference: https://editor.p5js.org/biggerpicture/sketches/POg_IV6t2
function radialGradient(sX, sY, sR, eX, eY, eR, colorS, colorE) {
  var gradient = drawingContext.createRadialGradient(sX, sY, sR, eX, eY, eR);

  gradient.addColorStop(0, colorS);
  gradient.addColorStop(1, colorE);

  drawingContext.fillStyle = gradient;
}

//create perlin noise
class Particle {
  constructor() {
    this.pos = createVector(random(width), random(height));
    this.vel = createVector();
    this.acc = createVector();
    this.speed = 2;

    this.color = color(135, 206, 250);
  }

  follow(flowfield) {
    var x = floor(this.pos.x / scl);
    var y = floor(this.pos.y / scl);
    var index = x + y * cols;
    var force = flowfield[index];
    this.applyForce(force);
  }

  update() {
    this.vel.add(this.acc);
    this.vel.limit(this.speed);
    this.pos.add(this.vel);
    this.acc.mult(0);
  }

  applyForce(force) {
    this.acc.add(force);
  }

  edges() {
    if (this.pos.x > width) this.pos.x = 0;
    if (this.pos.x < 0) this.pos.x = width;
    if (this.pos.y > height) this.pos.y = 0;
    if (this.pos.y < 0) this.pos.y = height;
  }

  show() {
    var d = dist(this.pos.x, this.pos.y, random(), random());
    if (d < 50) {
      this.color = color(173, 216, 230, 5);
    } else {
      this.color = color(255, 255, 255, 5);
    }
    pg.strokeWeight(2);

    if (random(1) < 0.01) {
      pg.stroke(255, 255, 255, 200);
      pg.strokeWeight(1);
    } else {
      pg.stroke(this.color);
    }
    pg.point(this.pos.x, this.pos.y);
  }
}

