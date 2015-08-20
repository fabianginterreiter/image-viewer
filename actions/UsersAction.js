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
        callback(null, result.rows);    
      });
    });
  }
}