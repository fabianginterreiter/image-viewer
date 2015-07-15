var express = require('express');
var router = express.Router();
var _ = require('lodash');
var sharp = require('sharp');
var Archiver = require('archiver');
var database = require('../utils/Database');

var console = process.console;

function getIntFromRequest(req, name, fallback) {
  if (req.param(name)) {
    return parseInt(req.param(name));
  } else {
    return fallback;
  }
}

function generateZipForImages(req, res, images) {

  var maxWidth = getIntFromRequest(req, 'width', null);
  var maxHeight = getIntFromRequest(req, 'height', null);

  var archive = Archiver('zip');
  archive.pipe(res);

  var name = 'images.zip'
  if (req.param('name')) {
    name = req.param('name');
  }

  res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-disposition': 'attachment; filename=' + name
  });

  var loaded = _.after(images.length, function() {
    // res.send(zipper.toBuffer());
    archive.finalize();
  });

  _.forEach(images, function(image) {
    console.log(image);
    var p = sharp(req.config.get('root') + image.path).withMetadata();

    if (maxWidth > 0 || maxHeight > 0) {
      p.resize(maxWidth, maxHeight).max()
    }
    
    p.rotate().toBuffer(function(err, buffer) {
      archive.append(buffer, { name:image.name });
      loaded();
    });
  });
}

router.get('/gallery/:id', function(req, res) {
  var id = req.param('id');


  database.connect(function(err, client, done) {
    client.query('SELECT images.name AS name, directories.path || images.name AS path FROM gallery_image JOIN images ON gallery_image.image_id = images.id JOIN directories ON images.directory_id = directories.id WHERE gallery_image.gallery_id = $1 ORDER BY images.created_at', [id], function(err, result) {
      done();
      generateZipForImages(req, res, result.rows);
    });
  });
});

router.get('/images/:ids', function(req, res) {
  var image_ids = req.param('ids').split('+');

  database.connect(function(err, client, done) {
    client.query('SELECT images.name AS name, directories.path || images.name AS path FROM images JOIN directories ON images.directory_id = directories.id WHERE images.id IN (' + image_ids.join(',') + ')', [], function(err, result) {
      done();
      console.log(err);
      generateZipForImages(req, res, result.rows);
    });
  });
});


module.exports = router;