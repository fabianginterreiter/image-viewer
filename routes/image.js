"use strict"

var express = require('express');
var router = express.Router();
var ExifImage = require('exif').ExifImage;
var sizeOf = require('image-size');
var sharp = require('sharp');
var fs = require('fs');
var _ = require('lodash');
var database = require('../utils/Database');
var request = require('request');
var ImagesAction = require('../actions/ImagesAction');

var console = process.console;

var knex = require('knex')({
  client: 'postgres',
  connection: {
    host     : 'localhost',
    user     : 'postgres',
    password : '',
    database : 'images'
  },
  debug: true
});

function getCachePath(req, image) {
  return req.config.get('cache') + '/' + image.id + '.jpg';
}

function getFullpath(req, image) {
  return req.config.get('root') + image.path + image.name;
}


function getIntFromRequest(req, name, fallback) {
  if (req.param(name)) {
    return parseInt(req.param(name));
  } else {
    return fallback;
  }
}

function updateImage(client, id, callback) {
  console.time().tag('images').info('Set Update Time for Image: ' + id);
  client.query('UPDATE images SET updated_at = now() WHERE id = $1', [id], callback);
}

var handleCallback = function(res, err, result) {
  if (err) {
    console.time().tag('PersonRoutes').info(err);
    return res.status(500).send("fehler");
  }

  if (!result) {
    res.status(404).send('Not found');
  }

  res.send(result);
};



var imagesAction = new ImagesAction(database, knex);

router.put('/:id', function(req, res) {
  var image = req.body;
  database.connect(function(err, client, done) {
    client.query('UPDATE images SET gps = $1, latitude = $2, longitude = $3, title = $4 WHERE id = $5', 
      [image.gps, image.latitude, image.longitude, image.title, image.id], function(err, result) {
        updateImage(client, image.id, function(err) {
          done();
          res.send("OK")
        });
      });
  });
});

router.get('/:id/related', function(req, res) {
  var id = req.param('id');

  var options = {
    limit : req.param('limit')
  };

  imagesAction.getRelated(id, options, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/', function(req, res) {
  var action = req.param('action');

  imagesAction.getImages(action, {
    limit : req.param('limit'),
    used : req.param('used'),
    persons : req.param('persons'),
    personsOnly : req.param('personsOnly'),
    tags : req.param('tags'),
    tagsOnly : req.param('tagsOnly'),
    galleries : req.param('galleries'),
    galleriesOnly : req.param('galleriesOnly'),
    minDate : req.param('minDate'),
    maxDate : req.param('maxDate'),
    query : req.param('query'),
    orientation : req.param('orientation'),
    lat1 : req.param('lat1'),
    lon1 : req.param('lon1'),
    lat2 : req.param('lat2'),
    lon2 : req.param('lon2')
  }, function(err, result) {
    handleCallback(res, err, result);
  });  
});

router.get('/:id/exif', function(req, res) {
  console.info("Access to exif");

  var id = req.param('id');

  database.connect(function(err, client, done) {
    client.query('SELECT directories.path || images.name AS path FROM images JOIN directories ON images.directory_id = directories.id WHERE images.id = $1', [id], function(err, result) {
      done();
      new ExifImage({image : req.config.get('root') + result.rows[0].path}, function (error, exifData) {
        res.send(exifData);
      });
    });
  }); 
});

router.get('/:id/reload', function(req, res) {
  var id = req.param('id');

  database.connect(function(err, client, done) {
    client.query('SELECT directories.path || images.name AS path FROM images JOIN directories ON images.directory_id = directories.id WHERE images.id = $1', [id], function(err, result) {
      var image = sharp(req.config.get('root') + result.rows[0].path);
      image.metadata(function(err, metadata) {
        res.send(metadata);
      });
    });
  });
});

router.get('/:id', function(req, res) {
  var id = req.param('id');

  imagesAction.setRoot(req.config.get('root'));

  imagesAction.get(req.session.user, id, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/tags', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT tags.* FROM tags JOIN image_tag ON image_tag.tag_id = tags.id WHERE image_tag.image_id = $1', [req.param('id')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/persons', function(req, res) {
  var id = req.param('id');
  database.connect(function(err, client, done) {
    client.query('SELECT persons.id, persons.name, image_person.x, image_person.y FROM persons JOIN image_person ON persons.id = image_person.person_id WHERE image_person.image_id = $1;', [id], function(err, result) {
      res.send(result.rows);
      done();
    })
  });
});

router.delete('/:imageId/persons/:personId', function(req, res) {
  var imageId = req.param('imageId');
  var personId = req.param('personId');
  database.connect(function(err, client, done) {
    client.query('DELETE FROM image_person WHERE image_id = $1 AND person_id = $2;', [imageId, personId], function(err, result) {
      updateImage(client, imageId, function(err) {
        done();
        res.send("OK");  
      });
    });
  });
});

router.get('/:id/edit', function(req, res) {
  var id = req.param('id');

  req.database.getImage(id, function(err, image) {
    var fullpath = getFullpath(req, image);

    new sharp(fullpath).withMetadata().rotate(90).toFile(fullpath, function(err) {
      res.send({ error: err });
    });
  });
});

router.delete('/:ids', function(req, res) {
  console.time().tag('images').info(req.param('ids'));

  var ids = req.param('ids').split('+');

  if (ids.length === 0) {
    res.send("falsch");
    return;
  }

  console.time().tag('images').info('Deleting ' + ids.length + ' images (' + ids.join(',') + ')');

  database.query('UPDATE images SET deleted = true WHERE images.id IN (' + ids.join(',') + ')', [], function(err, result) {
    res.send('OK');
  });
});

router.get('/:id/resize', function(req, res) {
  var width = getIntFromRequest(req, 'width', 0);
  var height = getIntFromRequest(req, 'height', 0);
  var id = req.param('id');
  var min = req.param('min');

  imagesAction.setRoot(req.config.get('root'));

  imagesAction.resize(id, width, height, min, function(err, stream) {
    stream.pipe(res);
  });
});

router.get('/:id/thumb', function(req, res) {
  var maxWidth = getIntFromRequest(req, 'width', 500);
  var maxHeight = getIntFromRequest(req, 'height', 500);
  var id = req.param('id');

  if (id == 0) {
    res.send('');
  } else {

    var fullpath = req.config.get('cache') + '/' + id + '.jpg';

    try {
      new sharp(fullpath).resize(maxWidth, maxHeight).max().toBuffer(function(err, buffer) {
        if (err) {
          database.connect(function(err, client, done) {
            client.query('SELECT directories.path || images.name AS path FROM images JOIN directories ON images.directory_id = directories.id WHERE images.id = $1', [id], function(err, result) {
              done();
              var absolute = req.config.get('root') + result.rows[0].path;
              new sharp(absolute).resize(500, 500).max().rotate().toFile(fullpath, function(err) {
                new sharp(fullpath).resize(maxWidth, maxHeight).max().toBuffer(function(err, buffer) {
                  res.send(buffer);
                });
              });
            });
          });
        } else {
          res.send(buffer);
        }
      });  
    } catch (err) {
      console.info(err);
      res.send("achtung");
    }
  }
});

router.post('/:id/tags', function(req, res) {
  var id = req.param('id');
  var tag = req.body;
  database.connect(function(err, client, done) {
    updateImage(client, id, function(err) {
      if (tag.id) {
        client.query('INSERT INTO image_tag (image_id, tag_id) VALUES($1, $2)', [id, tag.id], function(err, result) {
          done();
          res.send(tag);
        });
      } else {
        client.query('INSERT INTO tags (text) VALUES($1) RETURNING id', [tag.text], function(err, result) {
          tag.id = result.rows[0].id;
          client.query('INSERT INTO image_tag (image_id, tag_id) VALUES($1, $2)', [id, tag.id], function(err, result) {
            done();
            res.send(tag);
          });
        });      
      }
    });
  });
});

router.delete('/:image_id/tags/:tag_id', function(req, res) {
  var image_id = req.param('image_id');
  var tag_id = req.param('tag_id');
  database.connect(function(err, client, done) {
    client.query('DELETE FROM image_tag WHERE image_id = $1 AND tag_id = $2', [image_id, tag_id], function(err, result) {
      updateImage(client, image_id, function(err) {
        res.send('OK');

        client.query('DELETE FROM tags WHERE id = $1 AND NOT EXISTS(SELECT 1 FROM image_tag WHERE image_tag.tag_id = $1)', [tag_id], function(err, result) {
          done();
        });
      });
    });
  });
});

router.post('/:id/persons', function(req, res) {
  var id = req.param('id');
  var person = req.body;

  imagesAction.addPerson(id, person, function(err, result) {
    handleCallback(res, err, result);
  });
});



module.exports = router;