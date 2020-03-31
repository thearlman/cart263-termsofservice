//~~~~~~~~~~~~~~~~~~
//Terms of service (pt 2)
//~~~~~~~~~~~~~~~~~~
//By: Asa Perlman
//
//In brief:
//This website is part two of another  project by the same name. Part one is a
//kiosk, images of which may be seen here: INSTER url
//

//testComment

//template for the object to hold the different parts of the faces
let featureObject = {
  leftEyebrows: [],
  rightEyebrows: [],
  leftEyes: [],
  rightEyes: [],
  noses: [],
  mouths: []
}

//variable to hold the user data (JSON) returned from server
let userData;

//~~~~~~~for vis.js:
//will become the vis object
let network;
//the nodes (images)
let nodes = [];
//edges (connections between the nodes)
let edges = [];
//will be the html element holding the vis.js canvas
let container;
//to hold the vis object's options
let options = {};


//when the window has loaded
window.onload = function() {
  //initiate socketIo
  let clientSocket = io();
  //when the socket recieves a message with the event name "handshake" log it out.
  //this is just an affirmation that the server is present
  clientSocket.on("handshake", function(message) {
    console.log(message);
  })
  //when the socket recieves a message with the event name "newData", run the
  //refresh images function
  clientSocket.on("newData", function(message) {
    refreshImages();
  });
  //refresh the images for the first time
  refreshImages();
}
//when the user double clicks
$(document).dblclick(makeFace);

//~~~~~refreshImages()
//
//makes a get request to the server for the image data, and refreshes the images
//with the new data appended
function refreshImages() {
  //initialize an ajax call with a type of "get", to the endpoint of "requestData"
  $.ajax({
    type: "GET",
    url: "/requestData",
    //on success, push the data returned from the server into the user data variable,
    //and create the
    success: (data) => {
      userData = data;
      createVisNetwork();
      console.log("Images Updated");
    },
    error: (err) => {
      console.log(err);
    }
  })
}


//~~~~~createVisNetwork()
//
//refreshes the vis network with the new data recieved from the server
function createVisNetwork() {
  //reset the parameters for the network
  nodes = [];
  edges = [];
  options = {};
  data = {};
  //reset the object holding the facial features
  resetfeatureObject();
  //temporary variable to store the current index of the feature being stored
  let featureId = 0;
  //iterate through all of the key in the images section of the userdata object
  for (let i = 0; i < Object.keys(userData.images).length; i++) {
    //pull the name of the key out of the object (type of facial feature)
    let featureType = Object.keys(userData.images)[i];
    //now iterate through all of the items contained in the feature type
    for (var e = 0; e < userData.images[featureType].length; e++) {
      //store the base64 (image data) in the object
      let base64 = userData.images[featureType][e];
      //create a new featureImage object, passing the current key (featureType) and the
      //base64 encoded image data
      let newFeature = new FeatureImage(featureType, base64);
      //puch it into the appropriate array of the featureObject
      featureObject[featureType].push(newFeature);
      //store the demographic data of the current feature image
      let demographicData = userData.demographics[e];
      //create an empty string to store the demographic data
      let demographicString = "";
      //iterate through all of the keys in the current demographic data object
      for (let o = 0; o < Object.keys(demographicData).length; o++) {
        //store the key name
        let demographic = Object.keys(demographicData)[o];
        //append the demographic string with the key, and it's value in an html readable format
        demographicString += `${demographic}:<br />${demographicData[demographic]} <br />`;
      }
      //push an object into the vis nodes array containing the an === to the
      //current feature id, a title === to the current demographic, an image ===
      //to a png with the current base64 data, defined as an image.
      nodes.push({
        id: featureId,
        title: demographicString,
        image: `data:image/png;base64,${base64}`,
        shape: "image"
      });
      //push an edge (connection) that goes from the current index, to the featureId variable
      //(this shoudl always be from the previous node to the current one)
      edges.push({
        from: e,
        to: featureId
      });
      //increase the feature id
      featureId++;
    }
  }
  //define the container as the user-defined "canvas" html element
  container = document.getElementById('canvas');
  //define vis data
  data = {
    nodes: nodes,
    edges: edges
  };
  //define vis options
  options = {
    interaction: {
      hover: true,
      dragView: false
    },
    edges: {}
  };
  //create new vis network
  network = new vis.Network(container, data, options);
  //do some funky stuff on hover maybe?
  network.on("hoverNode", function(node) {});
  //make a new face
  makeFace();
}

//~~~~~~~~makeFace()
//
//generates, and displays a new face mashup
function makeFace() {
  //choose a random piece of base64 encoded image data from the feature object
  let leftEyebrow = featureObject.leftEyebrows[Math.floor(Math.random() * (featureObject.leftEyebrows.length - 1))];
  // fill the corresponding facial feature html element with an image containging the base64 data
  $("#leftEyebrow").html(`<img src= "data:image/png;base64,${leftEyebrow.base64}" alt="a left eyebrow"/>`);

  //vvv~~~~~do the same for all the facial features~~~~~vvv

  let rightEyebrow = featureObject.rightEyebrows[Math.floor(Math.random() * (featureObject.rightEyebrows.length - 1))];
  $("#rightEyebrow").html(`<img src= "data:image/png;base64,${rightEyebrow.base64}" alt="a right eyebrow"/>`);

  let leftEye = featureObject.leftEyes[Math.floor(Math.random() * (featureObject.leftEyes.length - 1))];
  $("#leftEye").html(`<img src= "data:image/png;base64,${leftEye.base64}" alt="a left eye"/>`);

  let rightEye = featureObject.rightEyes[Math.floor(Math.random() * (featureObject.rightEyes.length - 1))];
  $("#rightEye").html(`<img src= "data:image/png;base64,${rightEye.base64}" alt="a right eye"/>`);

  let nose = featureObject.noses[Math.floor(Math.random() * (featureObject.noses.length - 1))];
  $("#nose").html(`<img src= "data:image/png;base64,${nose.base64}" alt="a nose"/>`);

  let mouth = featureObject.mouths[Math.floor(Math.random() * (featureObject.mouths.length - 1))];
  $("#mouth").html(`<img src= "data:image/png;base64,${mouth.base64}" alt="a mouth"/>`);

  //make the face html element 50% of the viewpoert width (default is 0)
  $("#face").css({
    width: "50vw"
  });
  //set a timeout to return to the default for 4 seconds later
  setTimeout(() => {
    $("#face").css({
      width: "0vw"
    });
  }, 4000)
}


//~~~~~FeatureObject()
//
//a simple object that defines the image of a facial feature
// is passed a type (nose, lefteyebrow etc.), and some base64 image data
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


//~~~~resetfeatureObject()
//
//simply resets the featureObject
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
