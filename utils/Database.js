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
}

var database = new Database('localhost', 'postgres', '', 'images');

export default database;