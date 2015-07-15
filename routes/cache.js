var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require('lodash');
var database = require('../utils/Database');
var console = process.console;

router.get('', function(req, res) {
  var result = {};

  fs.readdir(req.config.get('cache'), function(err, files) {
    result.files = files.length;
    result.size = 0;

    if (files.length === 0) {
      res.send(result);
    } else {
      var loaded = _.after(files.length, function() {
        res.send(result);
      });

      _.forEach(files, function(file) {
        fs.lstat(req.config.get('cache') + '/' +  file, function(err, stat) {
          result.size += stat.size;
          loaded();
        });
      });  
    }
  });
});

router.get('/d', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT image_id AS id FROM gallery_image GROUP BY image_id', [], function(err, result) {
      res.send(result.rows);
    });
  });
});

router.get('/clear', function(req, res) {
  fs.readdir(req.config.get('cache'), function(err, files) {
    var loaded = _.after(files.length, function() {
      res.send("OK");
    });

    _.forEach(files, function(file) {
      fs.unlink(req.config.get('cache') + '/' +  file, function(err) {
        loaded();
      });
    });
  });
});

module.exports = router;