var _ = require('lodash');
var pg = require('pg');

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

var database = new Database('localhost', 'postgres', '', 'images');

export default database;