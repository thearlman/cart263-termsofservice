let canvas;
let c;
let animate;
let imageData;
let featureObject = {
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
      userData = data;
      createImageObjects();
      console.log("Images Updated");
    },
    error: (err) => {
      console.log(err);
    }
  })
}

function createImageObjects() {
  nodes = [];
  edges = [];
  options = {};
  data = {};
  resetfeatureObject()
  let featureId = 0;
  for (let i = 0; i < Object.keys(userData.images).length; i++) {
    let featureType = Object.keys(userData.images)[i];
    for (var e = 0; e < userData.images[featureType].length; e++) {
      let base64 = userData.images[featureType][e];
      let newFeature = new FeatureImage(featureType, base64);
      featureObject[featureType].push(newFeature);
      let demographicData = userData.demographics[e];
      let demographicString = "";
      for (let o = 0; o < Object.keys(demographicData).length; o++) {
        let demographic = Object.keys(demographicData)[o];
        demographicString += `${demographic}:<br />${demographicData[demographic]} <br />`;
      }
      nodes.push({
        id: featureId,
        title: demographicString,
        image: `data:image/png;base64,${base64}`,
        shape: "image"
      });
      edges.push({
        from: e,
        to: featureId
      });
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
      hover: true,
      dragView: false
    },
    edges: {
    }
  };
  network = new vis.Network(container, data, options);
  network.on("hoverNode", function(node) {
  })
  makeFace();
}



function makeFace() {

  let leftEyebrow = featureObject.leftEyebrows[Math.floor(Math.random() * (featureObject.leftEyebrows.length - 1))];
  $("#leftEyebrow").html(`<img src= "data:image/png;base64,${leftEyebrow.base64}" alt=""/>`);

  let rightEyebrow = featureObject.rightEyebrows[Math.floor(Math.random() * (featureObject.rightEyebrows.length - 1))];
  $("#rightEyebrow").html(`<img src= "data:image/png;base64,${rightEyebrow.base64}" alt=""/>`);

  let leftEye = featureObject.leftEyes[Math.floor(Math.random() * (featureObject.leftEyes.length - 1))];
  $("#leftEye").html(`<img src= "data:image/png;base64,${leftEye.base64}" alt=""/>`);

  let rightEye = featureObject.rightEyes[Math.floor(Math.random() * (featureObject.rightEyes.length - 1))];
  $("#rightEye").html(`<img src= "data:image/png;base64,${rightEye.base64}" alt=""/>`);

  let nose = featureObject.noses[Math.floor(Math.random() * (featureObject.noses.length - 1))];
  $("#nose").html(`<img src= "data:image/png;base64,${nose.base64}" alt=""/>`);

  let mouth = featureObject.mouths[Math.floor(Math.random() * (featureObject.mouths.length - 1))];
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

function resetfeatureObject() {
  featureObject = {
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
