"use strict"

var express = require('express');
var router = express.Router();
var fs = require('fs');
var _ = require('lodash');
var mapper = require('../utils/mapper');
var ExifImage = require('exif').ExifImage;
var sharp = require('sharp');
var database = require('../utils/Database');
var ImageUtil = require('../utils/image');

var console = process.console;

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.startsWith = function(searchString, position) {
  position = position || 0;
  return this.lastIndexOf(searchString, position) === position;
};

function getPath(path) {
  if (path) {
    return path + '/';
  } else {
    return '/';
  }
}

class DirectoryLoader {
  constructor(id, root, cache, reload) {
    this.id = id;
    this.root = root;
    this.loaded = 0;
    this.reload = reload;

    this.cache = cache;

    this.result = {
      id : this.id,
      directories: [],
      images: [],
      navigation : []
    };
  }

  load(callback) {
    var that = this;

    this.callback = callback;
    
    database.connect(function(err, client, done) {
      client.query('SELECT * FROM directories WHERE id = $1', [that.id], function(err, result) {
        that.path = result.rows[0].path;

        that.result.name = result.rows[0].name;

        result.rows[0].position = that.result.navigation.length;
        that.result.navigation.push(result.rows[0]);

        that.getTree(client, result.rows[0].parent_id, function() {
          done();
          that.init();
        });
      });
    });
  }

  getTree(client, id, callback) {
    if (id === 0) {
      if (callback) {
        callback();
      }
      return;
    }
    var that = this;
    client.query('SELECT * FROM directories WHERE id = $1', [id], function(err, result) {
      var directory = result.rows[0];
      directory.position = that.result.navigation.length;
      that.result.navigation.push(directory);
      that.getTree(client, directory.parent_id, callback);
    });
  }

  init() {
    var that = this;

    if (this.reload) {

    }

    var loaded = _.after(this.reload ? 2 : 1, function() {
      if (that.reload) {
        that.handleFiles();  
      } else {
        that.result.directories = that.directories;
        that.result.images = that.images;

        that.callback(false, that.result);
      }
    });

    database.connect(function(err, client, done) {
      client.query('SELECT * FROM directories WHERE parent_id = $1', [that.id], function(err, result) {
        client.query('SELECT * FROM images WHERE directory_id = $1', [that.id], function(err, result) {
          that.images = result.rows;
          loaded();
          done();
        });
        that.directories = result.rows;
      });
    });

    if (this.reload) {
      var start = new Date().getTime();
      fs.readdir(this.root + this.path, function(err, files) {
        var end = new Date().getTime();
        var time = end - start;

        console.time().tag('directories').info("Duration readdir: " + time);

        if (err) {
          that.callback(err, that.result);
        } else {
          that.files = files;
          loaded();  
        }
      });  
    }
  }

  deleteDirectories() {
    var that = this;
    var temp = [];
    _.forEach(this.directories, function(directory) {
      if (!_.includes(that.files, directory.name)) {
        temp.push(directory.id);
      }
    });

    if (temp.length > 0) {
      database.connect(function(err, client, done) {
        client.query('DELETE FROM directories WHERE id IN (' + temp.join(',') + ')', function() {
          done();
        });
      });
    }
  }

  deleteImages() {
    var that = this;
    var temp = [];
    _.forEach(this.images, function(image) {
      if (!_.includes(that.files, image.name)) {
        temp.push(image.id);
      }
    });

    if (temp.length > 0) {
      database.connect(function(err, client, done) {
        client.query('DELETE FROM images WHERE id IN (' + temp.join(',') + ')', function() {
          done();
        });
      });
    }
  }

  handleFiles() {
    var that = this;

    var newDirectories = [];
    var newImages = [];

    var loaded = _.after(that.files.length + 1, function() {
      var saved = _.after(2, function() {
        that.callback(false, that.result);
 
        setTimeout(function() {
          console.info("jetzt");
          // that.deleteDirectories();
          // that.deleteImages();

          var notLoaded = [];
          _.forEach(that.result.images, function(image) {
            if (image.width === 0) {
              notLoaded.push(image);
            }
          });
          console.info("Number: " + notLoaded.length);
          that.postLoad(notLoaded);
        }, 100);
      });

      if (newDirectories.length > 0) {
        database.connect(function(err, client, done) {
          var loaded = _.after(newDirectories.length, function() {
            saved();
            done();
          });

          _.forEach(newDirectories, function(directory) {
            client.query('INSERT INTO directories (name, path, parent_id) VALUES($1, $2, $3) RETURNING id', 
                [directory.name, directory.path, that.id], function(err, result) {
              directory.id = result.rows[0].id;
              that.result.directories.push(directory);
              loaded();
            });
          });
        });
      } else {
        saved();
      }

      if (newImages.length > 0) {
        database.connect(function(err, client, done) {
          var loaded = _.after(newImages.length, function() {
            saved();
            done();
          });

          var preload = 20;

          _.forEach(newImages, function(image) {
            client.query('INSERT INTO images (name, directory_id, size, orientation, width, height, created_at) VALUES($1, $2, $3, $4, $5, $6, $7) RETURNING id', 
                [image.name, image.directory_id, image.size, image.orientation, image.width, image.height, image.created_at], function(err, result) {
              if (err) {
                console.tag('directories').time().info(err);
                console.tag('directories').time().info('Name: ' + image.name);
                loaded();
                return;
              }

              image.id = result.rows[0].id;
              that.result.images.push(image);
              

              if (preload > 0) {
                preload--;
                console.log("preloading: " + image.id);
                new sharp(that.root + that.path + image.name).resize(500, 500).max().rotate().quality(90)
                  .toFile(that.cache + '/' +  image.id + '.jpg', function(err) {
                    loaded();
                  });
              } else {
                loaded();
              }
            });
          });

        });
      } else {
        saved();
      }
    });

    loaded();

    _.forEach(that.files, function(file) {
      var fullpath = that.root + that.path + file;
      fs.stat(fullpath, function(err, stat) {
        if (err) {
          return;
        }

        if (stat.isDirectory()) {
          var entry = _.find(that.directories, ['name', file]);

          if (entry) {
            that.result.directories.push(entry);
          } else {
            newDirectories.push({
              name: file,
              path : that.path + file + '/'
            });  
          }
          loaded();
        } else {
          if (!file.toUpperCase().endsWith('JPG')) {
            loaded();
            return;
          }

          var entry = _.find(that.images, ['name', file]);

          if (entry) {
            that.result.images.push(entry);
            loaded();
          } else {
            if (that.loaded++ > 50) {
              newImages.push({
                name: file,
                directory_id: that.id,
                size: stat['size'],
                orientation: 0,
                width: 0,
                height: 0,
                created_at: null,
                path: that.path
              });
              loaded();
            } else {
              new ExifImage({image : that.root + that.path + file}, function (error, exifData) {
                var result = null;
                if (exifData.exif.CreateDate) {
                  var date = exifData.exif.CreateDate;
                  result = new Date(
                    date.substr(0,4), parseInt(date.substr(5,2)) - 1, date.substr(8,2),
                    parseInt(date.substr(11, 2)) + 1, date.substr(14,2), date.substr(17,2));
                }

                new sharp(that.root + that.path + file).metadata(function(err, metadata) {
                  newImages.push({
                    name: file,
                    directory_id: that.id,
                    size: stat['size'],
                    orientation: metadata.orientation,
                    width: metadata.width,
                    height: metadata.height,
                    created_at: result
                  });
                  loaded();
                });
              });
            }
          }
        }
      });
    });
  }

  postLoad(images) {
    if (images.length === 0) {
      return;
    }

    var that = this;

    var max = 50 < images.length ? 50 : images.length;
    var rest = images.slice(max, images.length);
    var toLoad = images.slice(0, max);

    database.connect(function(err, client, done) {
      var loaded = _.after(max, function() {
        done();
        that.postLoad(rest);
      });

      _.forEach(toLoad, function(image) {
        console.info("Load exif for: " + image.id);
        new ExifImage({image : that.root + that.path + image.name}, function (error, exifData) {
          var result = null;
          if (exifData.exif.CreateDate) {
            var date = exifData.exif.CreateDate;
            result = new Date(
              date.substr(0,4), parseInt(date.substr(5,2)) - 1, date.substr(8,2),
              parseInt(date.substr(11, 2)) + 1, date.substr(14,2), date.substr(17,2));
          }

          new sharp(that.root + that.path + image.name).metadata(function(err, metadata) {
            client.query('UPDATE images SET width = $1, height = $2, orientation = $3, created_at = $4 WHERE id = $5',
              [metadata.width, metadata.height, metadata.orientation, result, image.id]);
            loaded();
          });
        });
      });
    });
  }
}

router.get('/', function(req, res) {
  start(req, res, 0);
});

router.get('/:id', function(req, res) {

  if (req.param('images') !== 'false') {
    var id = 0;
    if (req.param('id')) {
      id = parseInt(req.param('id'));
    }

    start(req, res, id);
  } else {
    database.connect(function(err, client, done) {
      client.query('SELECT * FROM directories WHERE id = $1', [req.param('id')], function(err, result) {
        done();
        res.send(result.rows);
      });
    });
  }
});

function start(req, res, id) {
  var loaded = _.after(1, function() {
    new DirectoryLoader(id, req.config.get('root'), req.config.get('cache'), true).load(function(err, result) {
      //_.forEach(result.images, function(image) {
      //  image.created_at = image.created_at;
      //});

      if (err) {
        res.status(500).send('Something broke!');
      } else {
        res.send(result);  

        var preload = req.param('preload');
        if (preload === 'true') {
          setTimeout(function() {
            ImageUtil.preloadImages(req.config, result.images);
          }, 50);
        }
      }
    });
  });

  if (id === 0) {
    console.info("Determine ID for root directory.");

    database.connect(function(err, client, done) {
      client.query("SELECT id FROM directories WHERE path LIKE '/'", function(err, result) {
        if (result.rows && result.rows.length > 0) {
          id = result.rows[0].id;
          loaded();
          done();
        } else {
          client.query("INSERT INTO directories (name, path, parent_id) VALUES('Home', '/', 0) RETURNING id", function(err, result) {
            console.log(err);
            id = result.rows[0].id;
            loaded();
            done();
          });
        }
      });
    });
  } else {
    loaded();
  }
};

var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

router.post('/:id/images', upload.single('file'), function(req, res) {
  database.query('SELECT * FROM directories WHERE id = $1', [req.param('id')], function(err, result) {
    var writeStream = fs.createWriteStream(req.config.get('root') + result[0].path + req.file.originalname);

    var readStream = fs.createReadStream(req.file.path);

    readStream.on('end', function() {
      res.send('OK' + req.config.get('root') + result[0].path);
    });

    readStream.pipe(writeStream);
  });
});

router.get('/:id/used', function(req, res) {
  database.query('SELECT DISTINCT id FROM images WHERE directory_id = $1 AND (EXISTS(SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id) OR EXISTS(SELECT 1 FROM image_person WHERE image_person.image_id = images.id) OR EXISTS(SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id));', [req.param('id')], function(err, result) {
    var ids = [];
    _.forEach(result, function(el) {
      ids.push(el.id);
    });
    res.send(ids);
  });
});

router.get('/:id/unused', function(req, res) {
  database.query('SELECT DISTINCT id FROM images WHERE directory_id = $1 AND NOT EXISTS(SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id) AND NOT EXISTS(SELECT 1 FROM image_person WHERE image_person.image_id = images.id) AND NOT EXISTS(SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id);', [req.param('id')], function(err, result) {
    var ids = [];
    _.forEach(result, function(el) {
      ids.push(el.id);
    });
    res.send(ids);
  });
});

router.get('/:id/tags', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT tags.*, count(tags.id) AS count FROM tags JOIN image_tag ON tags.id = image_tag.tag_id JOIN images ON image_tag.image_id = images.id WHERE images.directory_id = $1 GROUP BY tags.id ORDER BY count DESC;', [req.param('id')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/tags/:tagId', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT * FROM tags WHERE id = $1;', [req.param('tagId')], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:id/tags/:tagId/images', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM images JOIN image_tag ON images.id = image_tag.image_id WHERE images.directory_id = $1 AND image_tag.tag_id = $2 ORDER BY images.created_at;', [req.param('id'), req.param('tagId')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/persons', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT persons.*, count(persons.id) AS count FROM persons JOIN image_person ON persons.id = image_person.person_id JOIN images ON images.id = image_person.image_id WHERE images.directory_id = $1 GROUP BY persons.id ORDER BY count DESC;', [req.param('id')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/persons/:personId', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT * FROM persons WHERE id = $1;', [req.param('personId')], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:id/persons/:personId/images', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id WHERE images.directory_id = $1 AND image_person.person_id = $2 ORDER BY images.created_at;', [req.param('id'), req.param('personId')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/galleries', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT galleries.*, count(galleries.id) AS count FROM galleries JOIN gallery_image ON galleries.id = gallery_image.gallery_id JOIN images ON gallery_image.image_id = images.id WHERE images.directory_id = $1 GROUP BY galleries.id ORDER BY count DESC;', [req.param('id')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/galleries/:galleryId', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT * FROM galleries WHERE id = $1;', [req.param('galleryId')], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:id/galleries/:galleryId/images', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM images JOIN gallery_image ON images.id = gallery_image.image_id WHERE images.directory_id = $1 AND gallery_image.gallery_id = $2 ORDER BY images.created_at;', [req.param('id'), req.param('galleryId')], function(err, result) {
      done();
      res.send(result.rows);
    });
  })
});

module.exports = router;