var ip = require('ip');
var http = require('http');
var httpProxy = require('http-proxy');
var HttpProxyRules = require('http-proxy-rules');
var request = require('request');
var fs = require('fs');

var BufferedNetstringStream = require('./libs/netstring').BufferedNetstringStream;
var Source = require('./config/source.json');

var kinectSource;
if (Source.Setting == 0) {
  kinectSource = Source.KinectStatic;
} else if (Source.Setting == 1) {
  kinectSource = Source.KinectGazebo;
}else {
  kinectSource = Source.KinectCorobot;
}
kinectSource.rgbEventId = "rgbupdate";
kinectSource.depthEventId = "depthupdate";

var kinectClients = [];
var kinectData = {
  "rgbData0": "event: rgbupdate\n",
  "rgbData1": "",
  "depthData0": "event: depthupdate\n",
  "depthData1": ""
};

function writeKinectImage(id, image) {
  var uri = 'data:image/jpeg;base64,' + image.toString('base64');

  kinectClients.forEach(function(client) {
    if (id === "rgbupdate") {
      //kinectData.rgbData0 = "event: " + id + "\n";
      kinectData.rgbData1 = 'data: ' + uri + '\n\n';
    } else if (id === "depthupdate") {
      //kinectData.depthData0 = "event: " + id + "\n";
      kinectData.depthData1 = 'data: ' + uri + '\n\n';
    }
  });
}

if (Source.Setting != 0) {
  request(kinectSource.rgb_url).pipe(new BufferedNetstringStream(kinectSource.rgbEventId)).on('data', writeKinectImage);
  request(kinectSource.depth_url).pipe(new BufferedNetstringStream(kinectSource.depthEventId)).on('data', writeKinectImage);
} else {
  fs.readFile(kinectSource.rgb_url, function(err, image) {
    if (err) throw err; // Fail if the file can't be read.
    var uri = 'data:image/jpeg;base64,' + image.toString('base64');
    kinectData.rgbData1 = 'data: ' + uri + '\n\n';
  });

  fs.readFile(kinectSource.depth_url, function(err, image) {
    if (err) throw err; // Fail if the file can't be read.
    var uri = 'data:image/jpeg;base64,' + image.toString('base64');
    kinectData.depthData1 = 'data: ' + uri + '\n\n';
  });
}

var kinectSSE = function(req, res){
  res.writeHead(200, {
    'Content-Type':  'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection':    'keep-alive'
  });

  kinectClients.push(res);

  var pusher = setInterval(function(){
    kinectClients.forEach(function(client) {
      client.write(kinectData.rgbData0);
      client.write(kinectData.rgbData1);
      client.write(kinectData.depthData0);
      client.write(kinectData.depthData1);
    });
  }, 100);

  req.on('close', function() {
    var index = kinectClients.indexOf(res);
    if (index != -1) {
      kinectClients.splice(index, 1);
    }

    if (pusher) {
      clearInterval(pusher);
    }
  });
};

// Set up proxy rules instance
var proxyRules = new HttpProxyRules({
  rules: {},
  default: 'http://localhost:8181' // default target
});

// Create reverse proxy instance
var proxy = httpProxy.createProxy();

// Create http server that leverages reverse proxy instance
// and proxy rules to proxy requests to different targets
var server = http.createServer(function(req, res) {

  if (req.url == '/kinect_images') {
    kinectSSE(req, res);
  } else {
    // a match method is exposed on the proxy rules instance
    // to test a request to see if it matches against one of the specified rules
    var target = proxyRules.match(req);
    if (target) {
      return proxy.web(req, res, {
        target: target
      });
    }

    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('The request url and path did not match any of the listed rules!');
  }
});

server.listen(3000, function(){
  console.log("Server listening on: http://" + ip.address() + ":3000");
});
