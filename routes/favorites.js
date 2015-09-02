var express = require('express');
var router = express.Router();
var database = require('../utils/Database');

var console = process.console;

var knex = require('knex')({
  client: 'postgres',
  connection: {
    host     : 'localhost',
    user     : 'postgres',
    password : '',
    database : 'images'
  }
});

import { FavoritesAction } from '../actions/FavoritesAction';

var favoritesAction = new FavoritesAction(knex);

var handleCallback = function(res, err, result) {
  if (err) {
    console.time().tag('PersonRoutes').info(err);
    return res.status(500).send("fehler");
  }
  res.send(result);
};

router.get('/', function(req, res) {
  favoritesAction.get(req.session.user, function(err, result) {
  	handleCallback(res, err, result);
  });
});

router.put('/:imageId', function(req, res) {
	favoritesAction.add(req.session.user, req.param('imageId'), function(err,result) {
    handleCallback(res, err, result);
	});
});

router.delete('/:imageId', function(req, res) {
  favoritesAction.delete(req.session.user, req.param('imageId'), function(err, result) {
    handleCallback(res, err, result);
  });
});

module.exports = router;