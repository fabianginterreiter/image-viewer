var express = require('express');
var router = express.Router();
var database = require('../utils/Database');

import { SessionAction } from '../actions/SessionAction';

var sessionAction = new SessionAction(database);

var handleCallback = function(res, err, result) {
  if (err) {
    console.time().tag('usersAction').info(err);
    return res.status(500).send("fehler");
  }

  res.send(result);
};

router.post('/', function(req, res) {
  var user = req.body;
  sessionAction.set(user, function(err, result) {
  	handleCallback(res, err, result);
  });
});

router.get('/', function(req, res) {
  sessionAction.get(function(err, result) {
  	handleCallback(res, err, result);
  });
});

router.delete('/', function(req, res) {
  sessionAction.delete(function(err, result) {
    handleCallback(res, err, result);
  });
});

module.exports = router;