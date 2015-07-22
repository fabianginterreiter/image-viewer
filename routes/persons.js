var express = require('express');
var router = express.Router();
var _ = require('lodash');
var database = require('../utils/Database');

var console = process.console;

router.get('/', function(req, res) {
  var query = req.param('query');

  database.connect(function(err, client, done) {
  	if (query) {
      client.query('SELECT persons.* FROM persons JOIN image_person ON persons.id = image_person.person_id WHERE LOWER(persons.name) LIKE LOWER($1) GROUP BY persons.id ORDER BY count(persons.id) DESC', ['%' + query + '%'], function(err, result) {
        done();
        res.send(result.rows);
      }); 
  	} else {
  	  client.query('SELECT persons.id, persons.name, count(persons) AS count FROM persons JOIN image_person ON image_person.person_id = persons.id GROUP BY persons.id ORDER BY count DESC;', [], function(err, result) {
        done();
        res.send(result.rows);
      });	
  	}
  });
});

router.get('/:id', function(req, res) {
  var id = req.param('id');

  database.connect(function(err, client, done) {
    client.query('SELECT * FROM persons WHERE id = $1', [id], function(err, result) {
      var person = result.rows[0];
      client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id WHERE image_person.person_id = $1 ORDER BY images.created_at, images.name', [id], function(err, result) {
        done();
        person.images = result.rows;
        res.send(person);
      });
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
    client.query('SELECT images.* FROM image_person JOIN images ON image_person.image_id = images.id WHERE image_person.person_id = $1' + gpsCondition + ' ORDER BY images.created_at', [id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.put('/:id', function(req, res) {
  var id = req.param('id');

  var person = req.body;

  database.connect(function(err, client, done) {
    client.query('UPDATE persons SET name = $1 WHERE id = $2', [person.name, id], function(err, result) {
      done();
      res.send("OK");
    });
  });
});

router.get('/:id/persons', function(req, res) {
  var id = req.param('id');

  database.connect(function(err, client, done) {
    client.query('SELECT pa.*, count(pa) as count FROM persons pa JOIN image_person ipa ON pa.id = ipa.person_id JOIN image_person ipp ON ipa.image_id = ipp.image_id WHERE ipp.person_id = $1 AND ipa.person_id != $1 GROUP BY pa.id ORDER BY count DESC', [id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/persons/:personId', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT * FROM persons WHERE id = $1', [req.param('personId')], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:id/persons/:person_id/images', function(req, res) {
  var id = req.param('id');
  var personId = req.param('person_id');
  database.connect(function(err, client, done) {
    client.query('SELECT i.* FROM images i JOIN image_person ipa ON ipa.image_id = i.id JOIN image_person ipp ON ipp.image_id = ipa.image_id WHERE ipp.person_id = $1 AND ipa.person_id = $2 ORDER BY i.created_at', [id, personId], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/tags', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT tags.*, count(tags.id) AS count FROM tags JOIN image_tag ON tags.id = image_tag.tag_id JOIN image_person ON image_tag.image_id = image_person.image_id WHERE image_person.person_id = $1 GROUP BY tags.id ORDER BY count DESC;', [req.param('id')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/tags/:tagId', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT * FROM tags WHERE id = $1', [req.param('tagId')], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:id/tags/:tagId/images', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id JOIN image_tag ON image_tag.image_id = images.id WHERE image_person.person_id = $1 AND image_tag.tag_id = $2 ORDER BY images.created_at;', [req.param('id'), req.param('tagId')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/directories', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT directories.id, directories.name, count(directories.id) FROM directories JOIN images ON directories.id = images.directory_id JOIN image_person ON images.id = image_person.image_id WHERE image_person.person_id = $1 GROUP BY directories.id ORDER BY count DESC', [req.param('id')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/directories/:directoryId', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT * FROM directories WHERE id = $1', [req.param('directoryId')], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:id/directories/:directoryId/images', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id WHERE images.directory_id = $2 AND image_person.person_id = $1 ORDER BY images.created_at;;', [req.param('id'), req.param('directoryId')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.delete('/:id', function(req, res) {
  var id = req.param('id');
  database.connect(function(err, client, done) {
    client.query('DELETE FROM persons WHERE id = $1', [id], function(err, result) {
      done();
      
      if (err) {
        return res.status(500).send("fehler");
      }

      res.send("OK");
    });
  });
});

module.exports = router;