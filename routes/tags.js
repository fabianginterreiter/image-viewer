var express = require('express');
var router = express.Router();
var _ = require('lodash');
var database = require('../utils/Database');

var console = process.console;

router.get('/', function(req, res) {
  console.time().tag('tags').info('Get all tags.');

  var query = req.param('query');

  database.connect(function(err, client, done) {
    if (query) {
      client.query('SELECT * FROM tags WHERE LOWER(text) LIKE LOWER($1)', ['%' + query + '%'], function(err, result) {
        if (err) {
          res.send(err);
        } else {
          done();
          res.send(result.rows);
        }
      });
    } else {
      client.query('SELECT tags.id, tags.text, count(image_tag) AS count FROM tags LEFT JOIN image_tag ON tags.id = image_tag.tag_id GROUP BY tags.id ORDER BY count DESC', [], function(err, result) {
        done();
        res.send(result.rows);
      });  
    }
    
  });
});

router.post('/', function(req, res) {
  var tag = req.body;
  database.connect(function(err, client, done) {
    client.query('INSERT INTO tags (text) VALUES($1) RETURNING id', [tag.text], function(err, result) {
      done();
      res.send({id: result.rows[0].id});
    });
  });
});

router.get('/:id', function(req, res) {
  var id = req.param('id');

  require('../controllers/tag').get(id, function(err, tag) {

    if (err) {
      return res.status(500).send(err);
    }

    if (!tag) {
      return res.status(404).send('No entry');
    }

    res.send(tag);
  });
});

router.put('/:id', function(req, res) {
  var tag = req.body;
  database.connect(function(err, client, done) {
    client.query('UPDATE tags SET text = $1 WHERE id = $2', [tag.text, req.param('id')], function(err, result) {
      done();
      res.send("OK");
    });
  });
});

router.delete('/:id', function(req, res) {
  var id = req.param('id');
  database.connect(function(err, client, done) {
    client.query('DELETE FROM tags WHERE id = $1', [id], function(err, result) {
      done();
      res.send('OK');
    });
  });
});

router.get('/:id/directories', function(req, res) {
  var id = req.param('id');
  database.connect(function(err, client, done) {
    client.query('SELECT directories.*, count(directories.id) AS count FROM directories JOIN images ON images.directory_id = directories.id JOIN image_tag ON images.id = image_tag.image_id WHERE image_tag.tag_id = $1 GROUP BY directories.id ORDER BY count DESC', [id], function(err, result) {
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
    client.query('SELECT images.* FROM images JOIN image_tag ON images.id = image_tag.image_id WHERE image_tag.tag_id = $1 AND images.directory_id = $2 ORDER BY images.created_at;', [req.param('id'), req.param('directoryId')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:id/persons', function(req, res) {
  var id = req.param('id');
  database.connect(function(err, client, done) {
    client.query('SELECT persons.*, count(persons.id) AS count FROM persons JOIN image_person ON image_person.person_id = persons.id JOIN image_tag ON image_tag.image_id = image_person.image_id WHERE image_tag.tag_id = $1 GROUP BY persons.id ORDER BY count DESC;', [id], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

router.get('/:tagId/persons/:personId', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT * FROM persons WHERE id = $1', [req.param('personId')], function(err, result) {
      done();
      res.send(result.rows[0]);
    });
  });
});

router.get('/:tagId/persons/:personId/images', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id JOIN image_tag ON images.id = image_tag.image_id WHERE image_person.person_id = $1 AND image_tag.tag_id = $2 ORDER BY images.created_at;', [req.param('personId'), req.param('tagId')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});
  
router.get('/:tagId/tags', function(req, res) {
  database.connect(function(err, client, done) {
    client.query('SELECT tags.*, count(tags.id) AS count FROM tags JOIN image_tag it1 ON tags.id = it1.tag_id JOIN images ON it1.image_id = images.id JOIN image_tag it2 ON images.id = it2.image_id WHERE it2.tag_id = $1 AND it1.tag_id != $1 GROUP BY tags.id ORDER BY count DESC;', [req.param('tagId')], function(err, result) {
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
    client.query('SELECT images.* FROM images JOIN image_tag t1 ON images.id = t1.image_id JOIN image_tag t2 ON images.id = t2.image_id WHERE t1.tag_id = $1 AND t2.tag_id = $2 ORDER BY images.created_at;', [req.param('id'), req.param('tagId')], function(err, result) {
      done();
      res.send(result.rows);
    });
  });
});

module.exports = router;