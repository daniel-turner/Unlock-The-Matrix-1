/*

  Test by posting to this server
    1 field -

      'key' : '0x5F,0x6B,0x77,0x83,0x8F,0x8E,0x8D,0x8C,0x8B,0x8A,0x89,0x88,0x53,0x11,0x12,0x13,0x14,0x15,0x16,0x22,0x2E,0x3A,0x46,0x87,0x47,0x10,0x70,0x6F,0x6E,0x62,0x56,0x4A,0x3E,0x32,0x52,0x86,0x3B,0xF,0x71,0x44,0x50,0x5C,0x68,0x67,0x66,0x26,0x5E,0x85,0x2F,0xE,0x72,0x38,0x40,0x34,0x35,0x36,0x65,0x1A,0x6A,0x84,0x23,0xD,0x73,0x2C,0x4C,0x41,0x42,0x37,0x64,0x1B,0x76,0x78,0x17,0x19,0x74,0x2B,0x58,0x4D,0x4E,0x43,0x63,0x1C,0x82,0x6C,0xB,0x25,0x75,0x2A,0x59,0x5A,0x5B,0x4F,0x57,0x1D,0x81,0x60,0xA,0x31,0x69,0x29,0x28,0x27,0x33,0x3F,0x4B,0x1E,0x80,0x54,0x9,0x3D,0x5D,0x51,0x45,0x39,0x2D,0x21,0x20,0x1F,0x7F,0x48,0x8,0x49,0x55,0x61,0x6D,0x79,0x7A,0x7B,0x7C,0x7D,0x7E,0x3C,0x7,0x6,0x5,0x4,0x3,0x2,0x1,0x0,0xC,0x18,0x24,0x30'

 */
var http = require('http');
var querystring = require('querystring');
var crypto = require('crypto');
var algorithm = 'aes-256-ctr';
var passwords = {
  test : { status: '971dd7cca6593b', secret: '8c1cc0dff905671d697991d3d8f3f7ba70a6031d38aec8c5223c', cracked : false },
  level12 : { status: 'ab7450f9a9bbc8', secret: 'b07547eaf6e79415ceee7fba44edc015da6357475d61583a3b2f', cracked : false },
  level24 : { status: 'f7e41b9b43efd8', secret: 'ece50c881cb3847aeed244f268381ef66f83a46ff3e031efc7c9', cracked : false },
  level48 : { status: '28a7dab8d70353', secret: '33a6cdab885f0f7aa788e1a36fbd04bbe1c462b4082c7f016a04', cracked : false },
  level96 : { status: '502214a67d22d6', secret: '4b2303b5227e8a40a54d95c4d6a32bdc13d7b3b52cbed7ac31a6', cracked : false }
};


var totalAttempts = 1;
var attempts = {};
var serverAddress = require( 'os' ).networkInterfaces( )['wlan0'].filter(function (inet) {
  return inet.family === 'IPv4';
})[0].address;

var Methods = {
  GET : 'GET',
  POST : 'POST'
}
var PORT = 1337;

function encrypt(key, text){
  var cipher = crypto.createCipher(algorithm,key)
  var crypted = cipher.update(text,'utf8','hex')
  crypted += cipher.final('hex');
  return crypted;
}

function decrypt(key, text){
  var decipher = crypto.createDecipher(algorithm,key)
  var dec = decipher.update(text,'hex','utf8')
  dec += decipher.final('utf8');
  return dec;
}

var server = http.createServer(handleRequest).listen(PORT, function () {
  console.log('Matrix server started listening on', serverAddress, PORT);
});

function handleRequest(request, response){
  var responseBody = JSON.stringify({ status : 'fail', message : 'Follow the White Rabbit. POST if you are the ONE.' });

  if(request.method == Methods.POST){
    var body = '';
    request.on('data', function (data) {
      body += data;
    });
    request.on('end', function () {
      var bodyVals = querystring.parse(body);
      response.statusCode = 401;
      var responseBody = { success : false };

      Object.keys(passwords).filter(function (key) {
        return !passwords[key].cracked;
      }).filter(function (key) {
        return decrypt(bodyVals.key, passwords[key].status) == 'success';
      }).map(function (keyFound) {
        return { 'success' : true, 'secret' : decrypt(bodyVals.key, passwords[keyFound].secret) };
      }).forEach(function (answer) {
        response.statusCode = 200;
        responseBody = answer;
      });

      if(!attempts.hasOwnProperty(request.connection.remoteAddress)){
        attempts[request.connection.remoteAddress] = 1;
      }
      responseBody.totalAttempts = totalAttempts++;
      responseBody.yourAttempts = attempts[request.connection.remoteAddress]++;
      response.end(JSON.stringify(responseBody));

      console.log('-----------------------------\n',request.connection.remoteAddress,'\n',bodyVals.key,'\n',responseBody,'\n','===========================');
    });
  }else{
    response.end(responseBody);
  }

}