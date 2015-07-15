var fs = require('fs');
var mapper = require('../utils/mapper');
var sharp = require('sharp');
var root = 'images';
var cache = 'cache/';
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
