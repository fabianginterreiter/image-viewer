var express = require('express');
var router = express.Router();
var _ = require('lodash');
var database = require('../utils/Database');

var console = process.console;

// SELECT COUNT(*) FROM persons;


router.get('', function(req, res) {
  

  database.connect(function(err, client, done) {
    var stats = { };

    var loaded = _.after(8, function() {
      done();
      res.send(stats);
    });

    var load = function(q, name) {
      client.query(q, function(err, result) {
        stats[name] = result.rows[0].count;
        loaded();
      });
    };

    load('SELECT COUNT(*) FROM images;', 'images');
    load('SELECT COUNT(*) FROM directories;', 'directories');
    load('SELECT COUNT(*) FROM persons;', 'persons');
    load('SELECT COUNT(*) FROM (SELECT DISTINCT image_person.image_id FROM image_person) AS images;', 'imagesWithPersons');
    load('SELECT COUNT(*) FROM tags;', 'tags');
    load('SELECT COUNT(*) FROM (SELECT DISTINCT image_tag.image_id FROM image_tag) AS images;', 'imagesWithTags');
    load('SELECT COUNT(*) FROM galleries;', 'galleries');
    load('SELECT COUNT(*) FROM (SELECT DISTINCT gallery_image.image_id FROM gallery_image) AS images;', 'imagesInGalleries');
  });
});

module.exports = router;