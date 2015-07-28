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

router.put('/:id', function(req, res) {
  var image = req.body;
  database.connect(function(err, client, done) {
    client.query('UPDATE images SET gps = $1, latitude = $2, longitude = $3 WHERE id = $4', 
      [image.gps, image.latitude, image.longitude, image.id], function(err, result) {
        updateImage(client, image.id, function(err) {
          done();
          res.send("OK")
        });
      });
  });
});

router.get('/', function(req, res) {
  var action = req.param('action');

  switch (action) {
    case 'random':
      var limit = req.param('limit') ? req.param('limit') : '10';
      if (req.param('used')) {
        if (req.param('used') === 'true') {
          database.query('SELECT * FROM images WHERE (EXISTS(SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id) OR EXISTS(SELECT 1 FROM image_person WHERE image_person.image_id = images.id) OR EXISTS(SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id)) ORDER BY random() LIMIT $1;', [limit], function(err, result) {
            res.send(result);
          });
        } else {
          database.query('SELECT * FROM images WHERE NOT EXISTS(SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id) AND NOT EXISTS(SELECT 1 FROM image_person WHERE image_person.image_id = images.id) AND NOT EXISTS(SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id) ORDER BY random() LIMIT $1;', [limit], function(err, result) {
            res.send(result);
          });
        }
      } else {
        database.connect(function(err, client, done) {
          client.query('SELECT * FROM images ORDER BY random() LIMIT $1;', [limit], function(err, result) {
            done();
            res.send(result.rows);
          });
        });
      }
      break;
    case 'marked':
      database.connect(function(err, client, done) {
        client.query('SELECT images.*, count(images.id) as count FROM images JOIN image_person ON images.id = image_person.image_id GROUP BY images.id ORDER BY count DESC;', [], function(err, result) {
          done();
          res.send(result.rows);
        });
      });
      break;
    case 'newest':
      database.connect(function(err, client, done) {
        client.query('SELECT * FROM images ORDER BY added_at DESC LIMIT 10', [], function(err, result) {
          done();
          res.send(result.rows);
        });
      });
      break;
    case 'updated':
      database.connect(function(err, client, done) {
        client.query('SELECT * FROM images ORDER BY updated_at DESC LIMIT 10', [], function(err, result) {
          done();
          res.send(result.rows);
        });
      });
      break;
    case 'search':
      var conditions = [];
      conditions.push('1 = 1');

      if (req.param('persons')) {
        var personIds = req.param('persons').split(',');
        _.forEach(personIds, function(id) {
          conditions.push('EXISTS (SELECT 1 FROM image_person WHERE images.id = image_person.image_id AND image_person.person_id = ' + id + ')');
        });

        if (req.param('personsOnly') === 'true') {
          conditions.push('EXISTS (SELECT 1 FROM image_person WHERE image_person.image_id = images.id GROUP BY image_person.image_id HAVING count(image_person.image_id) = ' + personIds.length + ')');
        }
      } else if (req.param('personsOnly') === 'true') {
        conditions.push('NOT EXISTS (SELECT 1 FROM image_person WHERE image_person.image_id = images.id)');
      }



      if (req.param('tags')) {
        var tagIds = req.param('tags').split(',');
        _.forEach(tagIds, function(id) {
          conditions.push('EXISTS (SELECT 1 FROM image_tag WHERE images.id = image_tag.image_id AND image_tag.tag_id = ' + id + ')');
        });

        if (req.param('tagsOnly') === 'true') {
          conditions.push('EXISTS (SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id GROUP BY image_tag.image_id HAVING count(image_tag.image_id) = ' + tagIds.length + ')');
        }
      } else if (req.param('tagsOnly') === 'true') {
        conditions.push('NOT EXISTS (SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id)');
      }

      if (req.param('galleries')) {
        var galleryIds = req.param('galleries').split(',');
        _.forEach(galleryIds, function(id) {
          conditions.push('EXISTS (SELECT 1 FROM gallery_image WHERE images.id = gallery_image.image_id AND gallery_image.gallery_id = ' + id + ')');
        });

        if (req.param('galleriesOnly') === 'true') {
          conditions.push('EXISTS (SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id GROUP BY gallery_image.image_id HAVING count(gallery_image.image_id) = ' + galleryIds.length + ')');
        }
      } else if (req.param('galleriesOnly') === 'true') {
        conditions.push('NOT EXISTS (SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id)');
      }

      if (req.param('minDate')) {
        conditions.push('\''+req.param('minDate')+'\' <= images.created_at');
      }

      if (req.param('maxDate')) {
        conditions.push('\''+req.param('maxDate')+'\' >= images.created_at');
      }

      var query = 'SELECT images.* FROM images WHERE ' + conditions.join(' AND ') + ' ORDER BY images.created_at LIMIT 200';

      console.time().tag('Search').info(query);

      database.connect(function(err, client, done) {
        client.query(query, [], function(err, result) {
          if (err) {
            res.status(500).send(err);
          }
          done();
          res.send(result.rows);
        });
      });
      break;
    default:
      res.send([]);
  }

  
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

  database.connect(function(err, client, done) {
    client.query('SELECT * FROM images WHERE id = $1', [id], function(err, result) {
      
      if (err) {
        done();
        res.status(500).send(err);
        return;
      }
      if (result.rows.length === 0) {
        done();
        res.status(404).send('No Image with ID: ' + id);
        return;
      }

      var image = result.rows[0];

      client.query('SELECT galleries.id, galleries.name FROM galleries JOIN gallery_image ON galleries.id = gallery_image.gallery_id WHERE gallery_image.image_id = $1', [id], function(err, result) {

        image.galleries = result.rows;

        client.query('SELECT id, name FROM directories WHERE id = $1', [image.directory_id], function(err, result) {
          image.directory = result.rows[0];

          client.query('SELECT tags.* FROM tags JOIN image_tag ON image_tag.tag_id = tags.id WHERE image_tag.image_id = $1', [id], function(err, result) {
            image.tags = result.rows;

            client.query('SELECT persons.id, persons.name, image_person.x, image_person.y FROM persons JOIN image_person ON persons.id = image_person.person_id WHERE image_person.image_id = $1;', [id], function(err, result) {
              image.persons = result.rows;
              done();
              res.send(image);   
            });
          });
        });
      });
    });
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

  database.connect(function(err, client, done) {
    client.query('SELECT * FROM directories WHERE path LIKE $1', [req.config.get('trash') + '/'], function(err, result) {
      var trash = result.rows[0];

      console.time().tag('images').info('Trash ID: ' + trash.id + ' ' + trash.path);

      client.query('SELECT images.id AS id, directories.path || images.name AS path, images.name AS name FROM images JOIN directories ON images.directory_id = directories.id WHERE images.id IN (' + ids.join(',') + ')', [], function(err, result) {

        var images = result.rows;

        client.query('UPDATE images SET directory_id = $1 WHERE id IN (' + ids.join(',') + ')', [trash.id], function(err, result) {

          var loaded = _.after(images.length, function() {
            res.send("OK");
            done();
          });

          fs.readdir(req.config.get('root') + trash.path, function(err, files) {

            var getUniqueName = function(image) {
              if (files.indexOf(image.name) < 0) {
                return image.name;
              } else {
                var li = image.name.lastIndexOf('.');
                var a = image.name.substring(0, li);
                var e = image.name.substring(li);

                var n = 1;

                var naa = '';

                do {
                  naa = a + '_' + n + e;
                  n++;          
                } while (files.indexOf(naa) >= 0);
                return naa;
              }
            };

          
            _.forEach(images, function(image) {
              var fullpath = req.config.get('root') + image.path;
              
              var name = getUniqueName(image);

              if (name !== image.name) {
                client.query('UPDATE images SET name = $1 WHERE id = $2', [name, image.id]);
              }

              var newpath = req.config.get('root') + trash.path + name;

              console.time().tag('images').info('Rename ' + fullpath + ' to ' + newpath);

              fs.rename(fullpath, newpath, function(err) {
                loaded();
              });
            });
          });
        });
      });
    });
  });
});

router.get('/:id/resize', function(req, res) {
  var maxWidth = getIntFromRequest(req, 'width', 0);
  var maxHeight = getIntFromRequest(req, 'height', 0);
  var id = req.param('id');

  database.connect(function(err, client, done) {
    client.query('SELECT directories.path || images.name AS path FROM images JOIN directories ON images.directory_id = directories.id WHERE images.id = $1', [id], function(err, result) {
      done();

      var transformer = sharp().withMetadata().rotate();

      if (maxWidth > 0 || maxHeight > 0) {
        transformer.resize(maxWidth, maxHeight).max();
      }

      fs.createReadStream(req.config.get('root') + result.rows[0].path).pipe(transformer).pipe(res);
    });
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
  var image_id = req.param('id');
  var person = req.body;

  database.connect(function(err, client, done) {
    updateImage(client, image_id, function(err) {
      client.query('SELECT id FROM persons WHERE name LIKE $1', [person.name], function(err, result) {
        if (result.rows.length === 1) {
          person.id = result.rows[0].id;

          client.query('INSERT INTO image_person(image_id, person_id, x, y) VALUES($1, $2, $3, $4)', 
            [image_id, person.id, person.x, person.y],function(err, result) {
              done();
              res.send(person);
          });
        } else {
          client.query('INSERT INTO persons(name) VALUES($1) RETURNING id', [person.name], function(err, result) {
            person.id = result.rows[0].id;

            client.query('INSERT INTO image_person(image_id, person_id, x, y) VALUES($1, $2, $3, $4)', 
              [image_id, person.id, person.x, person.y],function(err, result) {
                done();
                res.send(person);
            });
          });
        }
      });
    });
  });
});



module.exports = router;