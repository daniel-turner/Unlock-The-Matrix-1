var http = require('http');
var querystring = require('querystring');
var Rotator = require('matrix-rotator').MatrixRotator;
var Matrix = require("../data/matrix.js");
var DIRECTION = require("matrix-rotator/Direction.js");
var PORT = 1337;
var IP_ADDRESS  = '10.0.1.6';
var success = false;
var trackMatrix = null;
var solutionQueue = [];
var testCount = 0;

function connectedToServer(response) {

  var outputBody = "";

  console.log('STATUS: ' + response.statusCode);
  console.log('HEADERS: ' + JSON.stringify(response.headers));

  response.setEncoding('utf8');

  response.on('data', function (chunk) {

    outputBody = JSON.parse(chunk);
  });

  response.on("end", function() {

    // console.log("disconnected from server");


    console.log(outputBody);

    if(outputBody.success === true) {

      console.log("SUCCESS!");
      success = true;
      console.log(trackMatrix);

    } else {

      if(solutionQueue.length > 0) {
        // var sourceMatrix = Matrix.getMatrix();

        testKey(dequeue());
      }
    }
  });

  response.on("error", function(error) {

    console.log("server reported an error : " + error);
    throw error;
  });
};

function checkLayerRotations(layers, matrix) {

  var rotations = (((layers * 2) + Math.floor(matrix.length%2))-1) * 4;
  var rotator = null;

  for(var i = 0; i < rotations; i++) {

    console.log("Rotating layer:" + layers);

    //rotate matrix
    rotator = new Rotator(matrix);
    rotator.rotateStep(DIRECTION.Direction.CW, layers);
    matrix = rotator.matrix;

    // console.log(matrix);
    //test key
    solutionQueue.push(matrix);

    if (solutionQueue.length > 100) {

      testKey(dequeue());
    }

    if(layers - 1 > 0) {

      matrix = checkLayerRotations(layers - 1, matrix);
    }
  }

  return matrix;
};

function dequeue() {

  if(solutionQueue.length > 0) {

    return solutionQueue.shift();

  } else {

    return false;
  }
};

function testKey(matrix) {

  console.log("Count: " + testCount);
  testCount++;

  var postData = "key=" + matrix.toString();

  // var postData = "key=" + "0x5F%2C0x6B%2C0x77%2C0x83%2C0x8F%2C0x8E%2C0x8D%2C0x8C%2C0x8B%2C0x8A%2C0x89%2C0x88%2C0x53%2C0x11%2C0x12%2C0x13%2C0x14%2C0x15%2C0x16%2C0x22%2C0x2E%2C0x3A%2C0x46%2C0x87%2C0x47%2C0x10%2C0x70%2C0x6F%2C0x6E%2C0x62%2C0x56%2C0x4A%2C0x3E%2C0x32%2C0x52%2C0x86%2C0x3B%2C0xF%2C0x71%2C0x44%2C0x50%2C0x5C%2C0x68%2C0x67%2C0x66%2C0x26%2C0x5E%2C0x85%2C0x2F%2C0xE%2C0x72%2C0x38%2C0x40%2C0x34%2C0x35%2C0x36%2C0x65%2C0x1A%2C0x6A%2C0x84%2C0x23%2C0xD%2C0x73%2C0x2C%2C0x4C%2C0x41%2C0x42%2C0x37%2C0x64%2C0x1B%2C0x76%2C0x78%2C0x17%2C0x19%2C0x74%2C0x2B%2C0x58%2C0x4D%2C0x4E%2C0x43%2C0x63%2C0x1C%2C0x82%2C0x6C%2C0xB%2C0x25%2C0x75%2C0x2A%2C0x59%2C0x5A%2C0x5B%2C0x4F%2C0x57%2C0x1D%2C0x81%2C0x60%2C0xA%2C0x31%2C0x69%2C0x29%2C0x28%2C0x27%2C0x33%2C0x3F%2C0x4B%2C0x1E%2C0x80%2C0x54%2C0x9%2C0x3D%2C0x5D%2C0x51%2C0x45%2C0x39%2C0x2D%2C0x21%2C0x20%2C0x1F%2C0x7F%2C0x48%2C0x8%2C0x49%2C0x55%2C0x61%2C0x6D%2C0x79%2C0x7A%2C0x7B%2C0x7C%2C0x7D%2C0x7E%2C0x3C%2C0x7%2C0x6%2C0x5%2C0x4%2C0x3%2C0x2%2C0x1%2C0x0%2C0xC%2C0x18%2C0x24%2C0x30";

  var options = {

    host: IP_ADDRESS,
    port: PORT,
    method: "POST",
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': postData.length
    }
  };

  var server = http.request(options, connectedToServer);

  server.write(postData);
  server.end();
};

var sourceMatrix = Matrix.getMatrix();
// solutionQueue.push(sourceMatrix);

// var layers = Math.floor(sourceMatrix.length/2);

testKey(sourceMatrix);

// checkLayerRotations(layers, sourceMatrix);




