var express = require('express');
var router = express.Router();
var database = require('../utils/Database');
var UsersAction = require('../actions/UsersAction');
var console = process.console;

var knex = require('../utils/Knex');

var usersAction = new UsersAction(database, knex);

var handleCallback = function(res, err, result) {
  if (err) {
    console.time().tag('usersAction').info(err);
    return res.status(500).send("fehler");
  }

  res.send(result);
};

router.get('/', function(req, res) {
  usersAction.getAll(req.param('query'), function(err, result) {
    handleCallback(res, err, result);
  });
});

router.post('/', function(req, res) {
  var body = req.body;
  usersAction.create(body, function(err, result) {
  	handleCallback(res, err, result);
  });
});

module.exports = router;