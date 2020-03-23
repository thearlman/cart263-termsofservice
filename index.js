// //~~~~~~~~~~~~~~~~~~~~~~~~EXPRESS~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
//this is the express library
let express = require('express');
//this is it's port
const portNumber = process.env.PORT || 3000;
//this is my http server
const app = express();
let bodyParser = require('body-parser');
// create a server (using the Express framework object)
let httpServer = require('http').createServer(app);
//initialize file system module
let fs = require('fs');
//unzip module
let unzip = require('unzip');
// for serving static files (i.e. css,js,html...)
let static = require('node-static');
//don't know what this does
app.use(express.static(__dirname + '/public'));
// for the client...
app.use(express.static(__dirname + '/node_modules'));
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(bodyParser.json());
app.use(bodyParser.raw({
  type: 'application/octet-stream',
  limit: '10mb'
}));


httpServer.listen(portNumber, function() {
  console.log(`HTTPS server is running on port ${portNumber}`);
  console.log(__dirname);
})

let io = require('socket.io')(httpServer);
io.on('connect', function(socket) {
  io.emit("handshake", "SERVER: Server is present");
})


app.post('/datain', function(req, res) {
  // io.emit("datain", req.body);
  fs.writeFile("userPackage.zip", req.body, function(err) {
    if (err) throw err;
    storeUsers(req, res);
    res.send("received");
  })
})

app.get('/requestData', dataDump);

let tempUser = {
  "user_number": 0,
  "rekData": "",
  "claData": "",
  images: {}
}
//~~~~~~~storeUsers()
//
//adds to the tempStore obj, until both sets of data are stored, then appends the index accordingly
//takes both the data, and the type of data
let dataCounter = 0;

function storeUsers() {
  fs.readFile('userIndex.json', function(err, data) {
    if (err) throw err;
    //parse the json
    let uIndex = JSON.parse(data);
    tempUser["user_number"] = uIndex.users.length;
    //open the zipped folder that arrived with the post request
    //run through the filenames and put them in their appropriate places.
    //also add to the temp user object, pushing it when all data is completed
    fs.createReadStream('userPackage.zip')
      .pipe(unzip.Parse())
      .on('entry', function(entry) {
        switch (entry.path) {
          case "faceDetails/rekData.json":
            entry.pipe(fs.createWriteStream(`userData/rekData_${uIndex.users.length}.json`));
            tempUser.rekData = `userData/rekData_${uIndex.users.length}.json`
            dataCounter++
            break;
          case "faceDetails/claData.json":
            entry.pipe(fs.createWriteStream(`userData/claData_${uIndex.users.length}.json`));
            tempUser.claData = `userData/rekData_${uIndex.users.length}.json`
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
        }
        if (dataCounter === 8) {
          uIndex.users.push(tempUser);
          fs.writeFile('userIndex.json', JSON.stringify(uIndex), function(err) {
            if (err) throw err;
            tempUser = {
              "user_number": 0,
              "rekData": "",
              "claData": "",
              images: {}
            }
            dataCounter = 0;
            io.emit("newData", "dataya");
          })
        }
      })
  })
}

function dataDump(req, res) {
  let images = {
    "mouths":[],
    "leftEyes": [],
    "rightEyes": [],
    "noses": [],
    "rightEyebrows": [],
    "leftEyebrows": []
  };
  fs.readFile('userIndex.json', function(err, data) {
    if (err) throw err;
    uIndex = JSON.parse(data);
    for (let i = 0; i < uIndex.users.length; i++){
      images.mouths.push(base64Encode(uIndex.users[i].images.mouth));
      images.leftEyes.push(base64Encode(uIndex.users[i].images.leftEye));
      images.rightEyes.push(base64Encode(uIndex.users[i].images.rightEye));
      images.noses.push(base64Encode(uIndex.users[i].images.nose));
      images.rightEyebrows.push(base64Encode(uIndex.users[i].images.rightEyebrow));
      images.leftEyebrows.push(base64Encode(uIndex.users[i].images.leftEyebrow));
    }
    res.send(images);
  })
}

function base64Encode(url) {
  // read binary data
  var bitmap = fs.readFileSync(url);
  // convert binary data to base64 encoded string
  return new Buffer(bitmap).toString('base64');
}
//
// function dataDump(req, res) {
//   let compressedData = {
//     rekData: [],
//     claData: []
//   };
//   let uIndex;
//   fs.readFile('userIndex.json', function(err, indexData) {
//     if (err) throw err;
//     uIndex = JSON.parse(indexData);
//     for (let i = 0; i < uIndex.users.length; i++) {
//       fs.readFile(uIndex.users[i].rekData, function(err, rekData) {
//         if (err) throw err;
//         // console.log(JSON.parse(rekData));
//         compressedData.rekData.push(JSON.parse(rekData));
//         fs.readFile(uIndex.users[i].claData, function(err, claData) {
//           if (err) throw err;
//           compressedData.claData.push(JSON.parse(claData));
//           if (compressedData.rekData.length === uIndex.users.length &&
//             compressedData.claData.length === uIndex.users.length) {
//             res.send(compressedData);
//             console.log("sent!");
//           }
//         })
//       })
//     }
//   })
// }


//base64 function: https://stackoverflow.com/questions/24523532/how-do-i-convert-an-image-to-a-base64-encoded-data-url-in-sails-js-or-generally

// ~~~~~~~THIS IS THE STOCK CODE THE NODE "WIZARD" MADE
// let http = require('http');
// let server = http.createServer(function(req, res) {
//   res.writeHead(200, {'Content-Type': 'text/plain'});
//   let message = 'It works!\n',
//   version = 'NodeJS ' + process.versions.node + '\n',
//   response = [message, version].join('\n');
//   res.end(response);
// });
// server.listen();
