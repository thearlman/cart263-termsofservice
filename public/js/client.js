window.onload = function(){
  let clientSocket = io();
  clientSocket.on("handshake", function(message){
    console.log(message);
  })
  clientSocket.on("datain", function(data){
    console.log(data);
    $("#kioskMessages").append(data);
  })
  clientSocket.on("newData", function(message){
    refreshImages();
  });
  refreshImages();
  console.log("running");
}


function refreshImages(){
  $.ajax({
    type:"GET",
    url:"/requestData",
    success: (data)=>{
      dumpImages(data);
    },
    error: (err)=>{
      console.log(err);
    }
  })
}
//tetsgitignore

function dumpImages(data){
  $('#kioskMessages').html("")
  for (let i = 0; i < Object.keys(data).length; i++) {
    let feature = Object.keys(data)[i];
    for (var e = 0; e < data[feature].length; e++) {
      let img = `<img src="data:image/png;base64,${data[feature][e]}" />`
      $('#kioskMessages').append(img)
    }
  }
}
