var _ = require('lodash');

var console = process.console;

export class UsersAction {
  constructor(database, knex) {
    this.database = database; 
    this.knex = knex;
  }

  setRoot(root) {
    this.root = root;
  }

  getAll(query, callback) {
    this.knex('users').select(
      'users.*',
      'persons.image_id AS image_id'
    ).leftJoin(
      'persons', 
      'users.person_id', 
      'persons.id'
    ).orderBy('name').then(function(rows) {
      callback(null, rows);
    }).catch(function(error) {
      callback(error);
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