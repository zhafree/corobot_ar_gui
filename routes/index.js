var express = require('express');
var router = express.Router();
var ip = require('ip');

var Source = require("../config/source.json");

var data = {server_ip: ip.address()};

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(JSON.stringify(data))
  res.render('index', { JD: JSON.stringify(data) });
});

module.exports = router;
