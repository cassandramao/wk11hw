let serial;
let portName = ""

let currentSensor = "" //potentiometer, photocell

let potValue = 0;
let photoValue = 0;

function setup() {
  createCanvas(600, 600)

  serial = new p5.SerialPort()

  serial.onList(gotList)
  serial.list()

  serial.onOpen(gotOpen)
  // serial.openPort(portName);

  serial.onData(gotData)
}

function draw() {
  background(0)
  noStroke()
  fill(photoValue, 30, 45)
  ellipse(width / 2, height / 2, potValue)
}

function gotList(portList) {
  for (let i = 0; i < portList.length; i++) {
    console.log(portList[i])
  }
}

function gotOpen() {
  console.log("Serial port is open on port: ", portName)
}

function gotData() {
  let currentString = serial.readLine();
  // console.log(currentString);
  if (currentString.length <= 0) return;
  // console.log(currentString);

  if (currentString === "potentiometer" ||
    currentString === "photocell") {
    currentSensor = currentString
    return
  }
  else {
    if (currentSensor === "potentiometer") {
      potValue = currentString
      return
    }
    if (currentSensor === "photocell") {
      photoValue = currentString
      return
    }
  }
}