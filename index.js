// //~~~~~~~~~~~~~~~~~~~~~~~~EXPRESS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//** modules in node.js are basically fancy libraries.
//this is the express module
let express = require('express');
//this is it's port
const portNumber = process.env.PORT || 3000;
//this is the http server
const app = express();
// this is the "body-parser" library, (a middleware used for formatting get and post requests)
let bodyParser = require('body-parser');
// create a server with the http module (using the Express framework object)
let httpServer = require('http').createServer(app);
//initialize file system module
let fs = require('fs');
//unzip module
let unzip = require('unzip');
// node-static module, for serving static files (i.e. css,js,html...)
let static = require('node-static');
//tell the express app to use the current filepath (__dirname) + the public directory (for client-side)
app.use(express.static(__dirname + '/public'));
// for the serverside
app.use(express.static(__dirname + '/node_modules'));
//tell the express app to url encode the data
app.use(bodyParser.urlencoded({
  extended: false
}));
//and to expect a .json format
app.use(bodyParser.json());
//and that the raw content will be of type "application/octet-stream"
app.use(bodyParser.raw({
  type: 'application/octet-stream',
  limit: '10mb'
}));

//begin listening for incoming requests from the client
httpServer.listen(portNumber, function() {
  console.log(`HTTPS server is running on port ${portNumber}`);
  console.log(__dirname);
})

//the socket.io module
let io = require('socket.io')(httpServer);
//when socket recieves a "connect" message form the client, send back a message
//syaing it's ready willing and able
io.on('connect', function(socket) {
  io.emit("handshake", "SERVER: Server is present");
})

//***FOR BELOW FUNCTION: need to include some kind of secret key in the body so that a random post
//request from a malicious source wont destroy my user index file (that would be devastating)
//set up a post endpoint of "/datain" (meaning when a client posts to https://www.myurl.com/datain)
//the block of code will be executed
app.post('/datain', function(req, res) {
  //use file system to write a zip file to the current directory
  fs.writeFile("userPackage.zip", req.body, function(err) {
    if (err) throw err;
    //on completion, run the store user function
    storeUsers();
    //let the client know you recieved, and handled the data
    res.send("received");
  })
})

//set up a get endpoint "/requestData", dump the data
app.get('/requestData', dataDump);

//a global temp user object, used below to append the userIndex file
let tempUser = {
  "user_number": 0,
  "rekData": "",
  "claData": "",
  images: {}
}

//used to count how many data sets have been stored from the post request
let dataCounter = 0;
//~~~~~~~storeUsers()
//
//adds to the tempStore obj, until both sets of data are stored, then appends the index accordingly
//takes both the data, and the type of data
function storeUsers() {
  //open up the user index file, storing it's content into the data variable
  fs.readFile('userIndex.json', function(err, data) {
    if (err) throw err;
    //parse the json, and store it in a more appropriate variable name
    let uIndex = JSON.parse(data);
    tempUser["user_number"] = uIndex.users.length;
    //select the folder that arrived with the post request and create an *async? read stream
    fs.createReadStream('userPackage.zip')
      //unzip and parse the data
      .pipe(unzip.Parse())
      //for each entry in the folder, run a switch case
      .on('entry', function(entry) {
        switch (entry.path) {
          //the file name exprected to be in the folder
          case "faceDetails/rekData.json":
            //write file into appropriate directory
            entry.pipe(fs.createWriteStream(`userData/rekData_${uIndex.users.length}.json`));
            //append the temporary user object with the file's location
            tempUser.rekData = `userData/rekData_${uIndex.users.length}.json`
            //increase the data counter
            dataCounter++
            //break out of the switch case...
            break;
          //and so on...
          case "faceDetails/claData.json":
            entry.pipe(fs.createWriteStream(`userData/claData_${uIndex.users.length}.json`));
            tempUser.claData = `userData/claData_${uIndex.users.length}.json`
            dataCounter++
            break;
          case "faceDetails/leftEyebrow.png":
            entry.pipe(fs.createWriteStream(`userImages/leftEyebrows/leftEyebrow_${uIndex.users.length}.png`));
            tempUser.images.leftEyebrow = `userImages/leftEyebrows/leftEyebrow_${uIndex.users.length}.png`;
            dataCounter++
            break;
          case "faceDetails/leftEye.png":
            entry.pipe(fs.createWriteStream(`userImages/leftEyes/leftEye_${uIndex.users.length}.png`));
            tempUser.images.leftEye = `userImages/leftEyes/leftEye_${uIndex.users.length}.png`;
            dataCounter++
            break;
          case "faceDetails/rightEyebrow.png":
            entry.pipe(fs.createWriteStream(`userImages/rightEyebrows/rightEyebrow_${uIndex.users.length}.png`));
            tempUser.images.rightEyebrow = `userImages/rightEyebrows/rightEyebrow_${uIndex.users.length}.png`;
            dataCounter++
            break;fixing
          case "faceDetails/rightEye.png":
            entry.pipe(fs.createWriteStream(`userImages/rightEyes/rightEye_${uIndex.users.length}.png`));
            tempUser.images.rightEye = `userImages/rightEyes/rightEye_${uIndex.users.length}.png`;
            dataCounter++
            break;
          case "faceDetails/nose.png":
            entry.pipe(fs.createWriteStream(`userImages/noses/nose_${uIndex.users.length}.png`));
            tempUser.images.nose = `userImages/noses/nose_${uIndex.users.length}.png`;
            dataCounter++
            break;
          case "faceDetails/mouth.png":
            entry.pipe(fs.createWriteStream(`userImages/mouths/mouth_${uIndex.users.length}.png`));
            tempUser.images.mouth = `userImages/mouths/mouth_${uIndex.users.length}.png`;
            dataCounter++
            break;
          default:
          console.log("something's a miss, WTF is this?::: "+entry);
        }
        //if the data counter has reached this unfortunately hardcoded number...
        if (dataCounter === 8) {
          //push the temporary user obbject into the userIndex object
          uIndex.users.push(tempUser);
          //write the newly appended uIndex object as the new userIndex file, replacing the old one
          fs.writeFile('userIndex.json', JSON.stringify(uIndex), function(err) {
            if (err) throw err;
            //reset the tempUser obj
            tempUser = {
              "user_number": 0,
              "rekData": "",
              "claData": "",
              images: {}
            }
            //reset the data counter
            dataCounter = 0;
            //let the client side know know there is new data available
            io.emit("newData", "dataya");
          })
        }
      })
  })
}


//~~~dataDump()
//
//sends the client side selected data from the user database
function dataDump(req, res) {
  //create a user data object template
  let userData = {
    images: {
      "mouths": [],
      "leftEyes": [],
      "rightEyes": [],
      "noses": [],
      "rightEyebrows": [],
      "leftEyebrows": [],
    },
    "demographics": []
  };
  //read the userIndex file, passing the content into a "data" variable
  fs.readFile('userIndex.json', function(err, data) {
    if (err) throw err;
    //once again, parse 'n' store in a descriptive variable
    let uIndex = JSON.parse(data);
    //run a for loop for as many times as there are stored users
    for (let i = 0; i < uIndex.users.length; i++) {
      //run the image urls stored in the uIndex object through a base64 encoder,
      //and push the data into the userData object.
      userData.images.mouths.push(base64Encode(uIndex.users[i].images.mouth));
      userData.images.leftEyes.push(base64Encode(uIndex.users[i].images.leftEye));
      userData.images.rightEyes.push(base64Encode(uIndex.users[i].images.rightEye));
      userData.images.noses.push(base64Encode(uIndex.users[i].images.nose));
      userData.images.rightEyebrows.push(base64Encode(uIndex.users[i].images.rightEyebrow));
      userData.images.leftEyebrows.push(base64Encode(uIndex.users[i].images.leftEyebrow));
      //push an empty dictionary into object so it is ready to recieve info later on
      userData.demographics.push({});
    }
    //run th epackage demographics function, passing it the
    //post response, userData, and uIndex objects
    packageDemographics(res, userData, uIndex)
  })
}

//~~~packageDemographics
//
//scrapes the desired demographic info from the stored files, and pushes them to
//the object to be sent in response to a post request
function packageDemographics(res, userData, uIndex) {
  //set up a data counter to keep track of how many things have been stored (this is becuase of the
  //async nature of fs.read/write)
  let dataCount = 0;
  //once again, for loop for as many users
  for (let i = 0; i < uIndex.users.length; i++) {
    //read in the corresponding clarifai json file (url is stored in the userIndex, file in seperate directory)
    //spits out json as var=>data
    fs.readFile(uIndex.users[i].claData, function(err, data) {
      console.log(i);
      if (err) throw err;
      //parse'n'store
      let claData = JSON.parse(data);
      //decode the ridiculously long path to the data we want from the clarifai .json
      let raceInfo = claData.outputs[0].data.regions[0].data.face.multicultural_appearance.concepts;
      //loop for as many objects there are in the cla data
      for (let e = 0; e < raceInfo.length; e++) {
        //create a key value pair for each one in our userData object
        userData.demographics[i][raceInfo[e].name] = raceInfo[e].value;
      }
      //increase the data count
      dataCount++
      //if as many datas as users
      if (dataCount >= uIndex.users.length) {
        //send that data on t'wards the client
        res.send(userData);
      }
    })
  }
}

function asyncDataSorer(dataSource, dataDestination, dataLimit){
  //This would be a nice function to write on a rainy day
  }

//~~~~~base64Encode
//
// encodes images into base64 data. not mine. see below:
// https://stackoverflow.com/questions/24523532/how-do-i-convert-an-image-to-a-base64-encoded-data-url-in-sails-js-or-generally
function base64Encode(url) {
  // read binary data
  var bitmap = fs.readFileSync(url);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}

//~~~~~~~~~~Keep this for reference
//
// ~~~~~~~THIS IS THE STOCK server CODE THE NODE "WIZARD" MADE in CPanel
//
// let http = require('http');
// let server = http.createServer(function(req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   let message = 'It works!\n',
//   version = 'NodeJS ' + process.versions.node + '\n',
//   response = [message, version].join('\n');
//   res.end(response);
// });
// server.listen();
