var express = require('express');
var router = express.Router();
var ip = require('ip');

var Source = require("../config/source.json");

var data = {server_ip: ip.address(),
            depth_url: "http://" + ip.address() + ":3000/depth_image",
            rgb_url: "http://" + ip.address() + ":3000/rgb_image"};

// Config->Source->Setting
// 0: using fake kinect image
// 1: using Gazebo kinect views
// 2: using corobot kinect views
if (Source.Setting == 0) {
  data.depth_url = "/test/test_depth.jpg";
  data.rgb_url = "/test/test_rgb.jpg";
}

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(JSON.stringify(data))
  res.render('index', { JD: JSON.stringify(data) });
});

module.exports = router;
