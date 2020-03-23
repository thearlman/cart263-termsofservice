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

$(document).on("click", makeFace);

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
  makeFace();
}


function draw() {
  c.clearRect(0, 0, window.innerWidth, window.innerHeight)
  updateImageLocations();
  // animate = window.requestAnimationFrame(draw);
}

function updateImageLocations() {
  for (let i = 0; i < Object.keys(featureObjects).length; i++) {
    let featureType = Object.keys(featureObjects)[i];
    for (let e = 0; e < featureObjects[featureType].length; e++) {
      let obj = featureObjects[featureType][e];
      obj.drift();
      c.drawImage(obj.image, obj.x, obj.y);
    }
  }
}

function makeFace() {
  // cancelAnimationFrame(animate);
  // c.clearRect(window.innerWidth / 4, window.innerHeight / 4, window.innerWidth / 2, window.innerHeight / 2);

  let leftEyebrow = featureObjects.leftEyebrows[Math.floor(Math.random() * (featureObjects.leftEyebrows.length))];
  $("#leftEyebrow").html(`<img src= "data:image/png;base64,${leftEyebrow.base64}" alt=""/>`);

  let rightEyebrow = featureObjects.rightEyebrows[Math.floor(Math.random() * (featureObjects.rightEyebrows.length))];
  $("#rightEyebrow").html(`<img src= "data:image/png;base64,${rightEyebrow.base64}" alt=""/>`);

  let leftEye = featureObjects.leftEyes[Math.floor(Math.random() * (featureObjects.leftEyes.length))];
  $("#leftEye").html(`<img src= "data:image/png;base64,${leftEye.base64}" alt=""/>`);

  let rightEye = featureObjects.rightEyes[Math.floor(Math.random() * (featureObjects.rightEyes.length))];
  $("#rightEye").html(`<img src= "data:image/png;base64,${rightEye.base64}" alt=""/>`);

  let nose = featureObjects.noses[Math.floor(Math.random() * (featureObjects.noses.length))];
  $("#nose").html(`<img src= "data:image/png;base64,${nose.base64}" alt=""/>`);

  let mouth = featureObjects.mouths[Math.floor(Math.random() * (featureObjects.mouths.length))];
  $("#mouth").html(`<img src= "data:image/png;base64,${mouth.base64}" alt=""/>`);
  $("body").css("user-select", "none")
  $("#face").css({
    width: "50vw"
  });

  setTimeout(() => {
    $("#face").css({
      width: "0vw"
    });
  }, 4000)
}



class FeatureImage {
  constructor(type, base64) {
    this.type = type;
    this.base64 = base64;
    this.image = new Image();
    this.image.src = `data:image/png;base64,${base64}`
    this.x = Math.floor(Math.random() * $("#canvas").width() - 100);
    this.y = Math.floor(Math.random() * $("#canvas").height() - 100);
  }
  drift() {
    this.x += (Math.random() * 1) + (Math.random() * -1);
    this.y += (Math.random() * 1) + (Math.random() * -1);
  }
}

function resetFeatureObjects() {
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
