"use strict"

var _ = require('lodash');
var pg = require('pg');
var config = require('config');

class Database {
  constructor(url, username, password, database) {
    this.conString = 'postgres://' + username + ':' + password + '@' + url + '/' + database;
  }

  connect(callback) {
    pg.connect(this.conString, function(err, client, done) {
      callback(err, client, done);
    });
  }

  query(s, arg, callback) {
    this.connect(function(err, client, done) {
      client.query(s, arg, function(err, result) {
        done();
        callback(err, result.rows);
      });
  	});
  }
}

var database = new Database(config.get('database').host, config.get('database').user, config.get('database').password, config.get('database').database);

module.exports = database;