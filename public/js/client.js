let canvas;
let c;
let animate;
let imageData;
let featureObjects = {
  leftEyebrows: [],
  rightEyebrows: [],
  leftEyes: [],
  rightEyes: [],
  noses: [],
  mouths: []
}

window.onload = function() {
  let clientSocket = io();
  clientSocket.on("handshake", function(message) {
    console.log(message);
  })
  clientSocket.on("datain", function(data) {
    console.log(data);
    $("#kioskMessages").append(data);
  })
  clientSocket.on("newData", function(message) {
    refreshImages();
  });
  canvas = document.getElementById("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  c = canvas.getContext("2d");
  console.log("running");
  refreshImages();
}

$(document).on("click", refreshImages);

function refreshImages() {
  $.ajax({
    type: "GET",
    url: "/requestData",
    success: (data) => {
      imageData = data;
      createImageObjects();
      console.log("Images Updated");
    },
    error: (err) => {
      console.log(err);
    }
  })
}


function createImageObjects() {
  resetFeatureObjects()
  for (let i = 0; i < Object.keys(imageData).length; i++) {
    let featureType = Object.keys(imageData)[i];
    for (var e = 0; e < imageData[featureType].length; e++) {
      let base64 = imageData[featureType][e];
      let newFeature = new FeatureImage(featureType, base64);
      featureObjects[featureType].push(newFeature);
    }
  }
  animate = window.requestAnimationFrame(draw);
}


function draw(){
  c.clearRect(0, 0, window.innerWidth, window.innerHeight)
  updateImageLocations();
  window.requestAnimationFrame(draw);
}

function updateImageLocations(){
  for (let i = 0; i < Object.keys(featureObjects).length; i++) {
    let featureType = Object.keys(featureObjects)[i];
    for (let e = 0; e < featureObjects[featureType].length; e++) {
      let obj = featureObjects[featureType][e];
      obj.drift();
      c.drawImage(obj.image, obj.x, obj.y);
    }
  }
}

class FeatureImage {
  constructor(type, base64) {
    this.type = type;
    this.image = new Image();
    this.image.src = `data:image/png;base64,${base64}`
    this.x = Math.floor(Math.random() * $("#canvas").width() - 100);
    this.y = Math.floor(Math.random() * $("#canvas").height() - 100);
  }
  drift(){
    // this.x += (Math.random() * .1) + (Math.random() * -.1);
    // this.y += (Math.random() * .1) + (Math.random() * -.1);
  }
}

function resetFeatureObjects(){
  featureObjects = {
    leftEyebrows: [],
    rightEyebrows: [],
    leftEyes: [],
    rightEyes: [],
    noses: [],
    mouths: []
  }
}

// let img = `<img src="data:image/png;base64,${imageData[feature][e]}" />`

//perlin noise generator:https://github.com/wwwtyro/perlin.js
