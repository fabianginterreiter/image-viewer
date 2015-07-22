var express = require('express');
var router = express.Router();
var mapper = require('../utils/mapper');
var _ = require('lodash');
var database = require('../utils/Database');

var console = process.console;

router.post('', function(req, res) {
  var gallery = req.body;
  var image_id = 0;
  if (gallery.images.length > 0) {
    image_id = gallery.images[0].id;
  } 
  var that = this;

  database.connect(function(err, client, done) {
    client.query('INSERT INTO galleries (name, description, image_id, parent_id) VALUES($1, $2, $3, $4) RETURNING id',
      [gallery.name, gallery.description, image_id, gallery.parent_id], function(err, result) {

        var id = result.rows[0].id;
        var loaded = _.after(gallery.images.length, function() {
          done();
          res.send({id: id });
        });

        _.forEach(gallery.images, function(image) {
          client.query('INSERT INTO gallery_image (gallery_id, image_id) VALUES($1, $2)', [id, image.id], function(err) {
            loaded();
          });
        });
    });
  });
});

router.get('', function(req, res) {
  if (req.param('query')) {
    database.connect(function(err, client, done) {
      client.query('SELECT * FROM galleries WHERE LOWER(name) LIKE LOWER($1) ORDER BY name', ['%' + req.param('query') + '%'], function(err, result) {
        done();
        res.send(result.rows);
      });
    });
  } else {
    var s = function(galleries, parent_id) {
      var result = [];
      _.forEach(galleries, function(gallery) {
        if (gallery.parent_id === parent_id) {
          gallery.galleries = s(galleries, gallery.id);
          result.push(gallery);
        }
      });
      return result;
    }

    database.connect(function(err, client, done) {
      client.query('SELECT * FROM galleries', function(err, result) {
        done();

        res.send(s(result.rows, '0'));
      });
    });
  }
});

var getParents = function(client, gallery, parents, callback) {
  if (gallery.parent_id != '0') {
    client.query('SELECT * FROM galleries WHERE id = $1', [gallery.parent_id], function(err, result) {
      var parent = result.rows[0];
      parent.order = parents.length;
      parents.push(parent);
      getParents(client, parent, parents, callback);
    });
  } else {
    if (callback) {
     callback(parents);
    }
  }
}

router.get('/:id', function(req, res) {
	var id = req.param('id');

  database.connect(function(err, client, done) {
    client.query('SELECT * FROM galleries WHERE id = $1', [id], function(err, result) {
      var gallery = result.rows[0];
      client.query('SELECT images.* FROM gallery_image JOIN images ON gallery_image.image_id = images.id WHERE gallery_image.gallery_id = $1 ORDER BY images.created_at', [id], function(err, result) {
        gallery.images = result.rows;

        client.query('SELECT * FROM galleries WHERE parent_id = $1', [id], function(err, result) {
          gallery.galleries = result.rows;

          getParents(client, gallery, [], function(parents) {
            done();
            gallery.parents = parents;
            res.send(gallery);
          });
        });
      });
    });
  });
});

router.put('/:id', function(req, res) {
  var id = req.param('id');
  var gallery = req.body;

  console.time().tag("galleries").info("Update Gallery: " + id);

  database.connect(function(err, client, done) {
    client.query('UPDATE galleries SET name = $1, description = $2, parent_id = $3, image_id = $4, updated_at = now() WHERE id = $5', 
      [gallery.name, gallery.description, gallery.parent_id, gallery.image_id, id], function(err, result) {
        done();
        res.send('OK');
      });
  });
});

router.get('/:id/images', function(req, res) {
  var id = req.param('id');

  
  var gpsCondition = '';
  if (req.param('gps') && req.param('gps').length > 0) {
    gpsCondition = ' AND gps = ' + req.param('gps');
  }

  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM gallery_image JOIN images ON gallery_image.image_id = images.id WHERE gallery_image.gallery_id = $1' + gpsCondition + ' ORDER BY images.created_at', [id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.delete('/:id', function(req, res) {
  var id = req.param('id');

  database.connect(function(err, client, done) {
    client.query('SELECT parent_id FROM galleries WHERE id = $1', [id], function(err, result) {
      client.query('UPDATE galleries SET parent_id = $1 WHERE parent_id = $2', [result.rows[0].parent_id, id], function(err) {
        client.query('DELETE FROM galleries WHERE id = $1', [id], function(err) {
          done();
          res.send("OK");
        });
      });
    });
  });
});

router.post('/:id/images', function(req, res) {
  var images = req.body;
  var id = req.param('id');

  database.connect(function(err, client, done) {
    var loaded = _.after(images.length, function() {
      done();
      res.send('OK');
    });

    _.forEach(images, function(image) {
      client.query('INSERT INTO gallery_image (gallery_id, image_id) VALUES($1, $2)', [id, image.id], function(err, result) {
        loaded();
      });
    });
  });
});

router.post('/:id/images/delete', function(req, res) {
  var images = req.body;
  var id = req.param('id');

  console.log(images);

  var image_ids = [];
  images.forEach(function(image) {
    image_ids.push(image.id);
  });

  database.connect(function(err, client, done) {
    client.query('DELETE FROM gallery_image WHERE gallery_id = $1 AND image_id IN (' + image_ids.join(',') + ')', [id], function(err, result) {
      done();
      res.send('OK');
    });
  });
});

router.get('/:id/directories', function(req, res) {
  var id = req.param('id');
  database.connect(function(err, client, done) {
    client.query('SELECT directories.id, directories.name, count(directories.id) AS count FROM directories JOIN images ON directories.id = images.directory_id JOIN gallery_image ON images.id = gallery_image.image_id WHERE gallery_image.gallery_id = $1 GROUP BY directories.id ORDER BY count DESC;', [id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:gallery_id/directories/:directory_id', function(req, res) {
  var directory_id = req.param('directory_id');

  database.connect(function(err, client, done) {
    client.query('SELECT * FROM directories WHERE id = $1', [directory_id], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:gallery_id/directories/:directory_id/images', function(req, res) {
  var gallery_id = req.param('gallery_id');
  var directory_id = req.param('directory_id');

  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM images JOIN gallery_image ON gallery_image.image_id = images.id WHERE gallery_image.gallery_id = $1 AND images.directory_id = $2;', [gallery_id, directory_id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/tags', function(req, res) {
  var id = req.param('id');
  database.connect(function(err, client, done) {
    client.query('SELECT tags.id, tags.text, count(tags.id) AS count FROM tags JOIN image_tag ON tags.id = image_tag.tag_id JOIN gallery_image ON image_tag.image_id = gallery_image.image_id WHERE gallery_image.gallery_id = $1 GROUP BY tags.id ORDER BY count DESC;', [id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:gallery_id/tags/:tag_id', function(req, res) {
  var tag_id = req.param('tag_id');
  database.connect(function(err, client, done) {
    client.query('SELECT * FROM tags WHERE id = $1', [tag_id], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:gallery_id/tags/:tag_id/images', function(req, res) {
  var gallery_id = req.param('gallery_id');
  var tag_id = req.param('tag_id');
  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM images JOIN gallery_image ON images.id = gallery_image.image_id JOIN image_tag ON images.id = image_tag.image_id WHERE gallery_image.gallery_id = $1 AND image_tag.tag_id = $2;', [gallery_id, tag_id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:gallery_id/persons', function(req, res) {
  var gallery_id = req.param('gallery_id');
  database.connect(function(err, client, done) {
    client.query('SELECT persons.id, persons.name, count(persons.id) as count FROM persons JOIN image_person ON persons.id = image_person.person_id JOIN gallery_image ON image_person.image_id = gallery_image.image_id WHERE gallery_image.gallery_id = $1 GROUP BY persons.id ORDER BY count DESC;', [gallery_id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:gallery_id/persons/:person_id', function(req, res) {
  var gallery_id = req.param('gallery_id');
  var person_id = req.param('person_id');
  database.connect(function(err, client, done) {
    client.query('SELECT * FROM persons WHERE id = $1;', [person_id], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:gallery_id/persons/:person_id/images', function(req, res) {
  var gallery_id = req.param('gallery_id');
  var person_id = req.param('person_id');
  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id JOIN gallery_image ON images.id = gallery_image.image_id WHERE gallery_image.gallery_id = $1 AND image_person.person_id = $2 ORDER BY images.created_at;', [gallery_id, person_id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/galleries', function(req, res) {
  database.query('SELECT galleries.*, count(galleries.id) AS count FROM galleries JOIN gallery_image gi1 ON galleries.id = gi1.gallery_id JOIN gallery_image gi2 ON gi1.image_id = gi2.image_id WHERE gi2.gallery_id = $1 AND galleries.id != $1 GROUP BY galleries.id ORDER BY count DESC;', [req.param('id')], function(err, result) {
    res.send(result);
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
  database.query('SELECT images.* FROM images JOIN gallery_image gi1 ON images.id = gi1.image_id JOIN gallery_image gi2 ON images.id = gi2.image_id WHERE gi1.gallery_id = $1 AND gi2.gallery_id = $2 ORDER BY images.created_at;', [req.param('id'), req.param('galleryId')], function(err, result) {
    res.send(result);
  });
});

module.exports = router;