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

router.get('/delete', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT directories.path || images.name AS path FROM images JOIN directories ON images.directory_id = directories.id WHERE deleted = true', [], function(err, result) {

      var loaded = _.after(result.rows.length, function() {
        client.query('DELETE FROM images WHERE deleted = true', [], function(err, client) {
          res.send("OK");
        });
      });

      _.forEach(result.rows, function(image) {
        var path = req.config.get('root') + image.path;

        console.time().tag('Trash').info('Deleting: ' + path);
        fs.unlink(path, function(err) {
          if (err) {

          }
          loaded();
        })
      });
    });
  });
});

router.put('/restore/:ids', function(req, res) {
  var ids = req.param('ids').split('+');
  database.query('UPDATE images SET deleted = false WHERE deleted = true AND id IN(' + ids.join(',') + ')', [], function(err, result) {
    res.send('OK');
  });
});


module.exports = router;