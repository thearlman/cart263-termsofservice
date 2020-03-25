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

let nodes = [];
let edges = [];
let container;
let network;
let options = {};




window.onload = function() {
  let clientSocket = io();
  clientSocket.on("handshake", function(message) {
    console.log(message);
  })

  clientSocket.on("newData", function(message) {
    refreshImages();
  });
  console.log("running");
  refreshImages();
}

$(document).dblclick(makeFace);

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
  let featureId = 0;
  for (let i = 0; i < Object.keys(imageData).length; i++) {
    let featureType = Object.keys(imageData)[i];
    for (var e = 0; e < imageData[featureType].length; e++) {
      let base64 = imageData[featureType][e];
      let newFeature = new FeatureImage(featureType, base64);
      featureObjects[featureType].push(newFeature);
      nodes.push({
        id: featureId,
        image: `data:image/png;base64,${base64}`,
        shape: "image"
      });
      edges.push({ from: featureId, to: featureId+1,});
      featureId++;
    }
  }
  container = document.getElementById('canvas');
  data = {
    nodes: nodes,
    edges: edges
  };
  options = {
    interaction: {
      dragView: false
    }
    // onInitialDrawComplete: makeFace
  };
  network = new vis.Network(container, data, options);
  // makeFace();
}



function makeFace() {

  let leftEyebrow = featureObjects.leftEyebrows[Math.floor(Math.random() * (featureObjects.leftEyebrows.length - 1))];
  $("#leftEyebrow").html(`<img src= "data:image/png;base64,${leftEyebrow.base64}" alt=""/>`);

  let rightEyebrow = featureObjects.rightEyebrows[Math.floor(Math.random() * (featureObjects.rightEyebrows.length - 1))];
  $("#rightEyebrow").html(`<img src= "data:image/png;base64,${rightEyebrow.base64}" alt=""/>`);

  let leftEye = featureObjects.leftEyes[Math.floor(Math.random() * (featureObjects.leftEyes.length - 1))];
  $("#leftEye").html(`<img src= "data:image/png;base64,${leftEye.base64}" alt=""/>`);

  let rightEye = featureObjects.rightEyes[Math.floor(Math.random() * (featureObjects.rightEyes.length - 1))];
  $("#rightEye").html(`<img src= "data:image/png;base64,${rightEye.base64}" alt=""/>`);

  let nose = featureObjects.noses[Math.floor(Math.random() * (featureObjects.noses.length - 1))];
  $("#nose").html(`<img src= "data:image/png;base64,${nose.base64}" alt=""/>`);

  let mouth = featureObjects.mouths[Math.floor(Math.random() * (featureObjects.mouths.length - 1))];
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
    this.width = this.image.width;
    this.height = this.image.height;
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
