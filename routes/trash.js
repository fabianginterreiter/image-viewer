var express = require('express');
var router = express.Router();
var ExifImage = require('exif').ExifImage;
var sizeOf = require('image-size');
var sharp = require('sharp');
var fs = require('fs');
var _ = require('lodash');
var database = require('../utils/Database');
var request = require('request');

var console = process.console;

router.get('/', function(req, res) {
  database.query('SELECT * FROM images WHERE deleted = true', [], function(err, result) {
    res.send(result);
  });
});


module.exports = router;