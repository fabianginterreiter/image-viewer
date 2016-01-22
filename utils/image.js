var fs = require('fs');
var mapper = require('../utils/mapper');
var sharp = require('sharp');
var root = 'images';
var cache = 'cache/';
var knex = require('../utils/Knex');
var cache_size = 1280;

fs.mkdir(cache + cache_size, function(err) {
});

function getCachePath(image) {
  return cache + image.id + '.jpg';
}

exports.createCacheCopy = function(image, callback) {
  if (!image.name.endsWith('JPG')) {
    return;
  }

  var fullpath = root + image.path + image.name;
  var cachepath = getCachePath(image);

  fs.readFile(cachepath, function(err, file) {
    if (file) {
      if (callback) {
        callback(file);
      }
    } else {
      sharp(fullpath).resize(500, 500).max().rotate().quality(90).toFile(cachepath).then(function() {
        if (callback) {
          callback();
        }
      });
    }
  });
};


exports.preloadImages = function(config, images) {
  preloadImagesIndex(config, images, 0);
}

function preloadImagesIndex(config, images, index) {
  if (index < images.length) {
    var image = images[index];
    exports.loadToPreview(config, image.id, function() {
      preloadImagesIndex(config, images, index + 1);
    });
  }
}

exports.loadToPreview = function(config, id, callback) {

  var fullpath = config.get('storage').cache + '/' + id + '.jpg';

  fs.stat(fullpath, function(err, stats) {
    if (stats) {
      if (callback) {
        callback(null, fullpath);
      }
    } else {
      knex('images')
        .select('directories.path AS path', 'images.name AS name')
        .join('directories', 'images.directory_id', 'directories.id')
        .where('images.id', id)
        .then(function(rows) {

          var image = rows[0];

          var absolute = config.get('root') + image.path + image.name;

          new sharp(absolute).resize(2000, 2000).max().quality(80).rotate().toFile(fullpath, function(err) {
            if (callback) {
              callback(err, fullpath);
            }
          });
        }).catch(function(e) {
          if (callback) {
            callback(e);
          }
        });
    }
  });
}