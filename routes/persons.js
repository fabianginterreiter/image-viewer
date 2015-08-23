var express = require('express');
var router = express.Router();
var _ = require('lodash');
var fs = require('fs');
var database = require('../utils/Database');

var console = process.console;

import { PersonsAction } from '../actions/PersonsAction';

var personsAction = new PersonsAction(database);

var handleCallback = function(res, err, result) {
  if (err) {
    console.time().tag('PersonRoutes').info(err);
    return res.status(500).send("fehler");
  }

  res.send(result);
};

router.get('/', function(req, res) {
  personsAction.getAll(req.param('query'), function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id', function(req, res) {
  var id = req.param('id');

  personsAction.get(req.session.user, id, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/image', function(req, res) {
  var id = req.param('id');

  fs.createReadStream('persons/' + id + '.png').pipe(res);
});

router.get('/:id/images', function(req, res) {
  var id = req.param('id');
  var gps = req.param('gps');
  
  personsAction.get(id, gps, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.put('/:id', function(req, res) {
  var id = req.param('id');
  var person = req.body;

  personsAction.update(id, person, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.put('/:id/image/:imageId', function(req, res) {
  var id = req.param('id');
  var imageId = req.param('imageId');
  var x = parseInt(req.param('x'));
  var y = parseInt(req.param('y'));
  var w = parseInt(req.param('w'));
  var h = parseInt(req.param('h'));

  personsAction.setRoot(req.config.get('root'));

  personsAction.setImage(id, imageId, x, y, w, h, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.delete('/:id', function(req, res) {
  var id = req.param('id');
  
  personsAction.delete(id, function(err, result) {
    handleCallback(res, err, result);
  })
});

router.get('/:id/persons', function(req, res) {
  var id = req.param('id');

  personsAction.getPersons(id, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/persons/:personId', function(req, res) {
  var personId = req.param('personId');

  personsAction.getPersonDetails(0, personId, function(err, result) {
    handleCallback(res, err, result);
  })
});

router.get('/:id/persons/:person_id/images', function(req, res) {
  var id = req.param('id');
  var personId = req.param('person_id');
  
  personsAction.getPersonImages(id, personId, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/tags', function(req, res) {
  var id = req.param('id');

  personsAction.getTags(id, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/tags/:tagId', function(req, res) {
  var id = req.param('id');
  var tagId = req.param('tagId');

  personsAction.getTagDetails(id, tagId, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/tags/:tagId/images', function(req, res) {
  var id = req.param('id');
  var tagId = req.param('tagId');

  personsAction.getTagImages(id, tagId, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/directories', function(req, res) {
  var id = req.param('id');

  personsAction.getDirectories(id, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/directories/:directoryId', function(req, res) {
  var directoryId = req.param('directoryId');

  personsAction.getDirectoryDetails(0, directoryId, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/directories/:directoryId/images', function(req, res) {
  var id = req.param('id');
  var directoryId = req.param('directoryId');

  personsAction.getDirectoryImages(id, directoryId, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/galleries', function(req, res) {
  var id = req.param('id');

  personsAction.getGalleries(id, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/galleries/:galleryId', function(req, res) {
  var id = req.param('id');
  var galleryId = req.param('galleryId');

  personsAction.getGalleryDetails(id, galleryId, function(err, result) {
    handleCallback(res, err, result);
  });
});

router.get('/:id/galleries/:galleryId/images', function(req, res) {
  var id = req.param('id');
  var galleryId = req.param('galleryId');

  personsAction.getGalleryImages(id, galleryId, function(err, result) {
    handleCallback(res, err, result);
  });
});

module.exports = router;