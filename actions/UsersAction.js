var _ = require('lodash');

var console = process.console;

export class UsersAction {
  constructor(database) {
    this.database = database; 
  }

  setRoot(root) {
    this.root = root;
  }

  getAll(query, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT * FROM users ORDER BY name', [], function(err, result) {
        done();
        callback(null, result.rows);    
      });
    });
  }

  create(user, callback) {
    this.database.connect(function(err, client, done) {
      client.query('INSERT INTO users (name) VALUES($1) RETURNING id', [user.name], function(err, result) {
        done();
        var id = result.rows[0].id;
        user.id = id;
        callback(null, user);
      });
    });
  }
}