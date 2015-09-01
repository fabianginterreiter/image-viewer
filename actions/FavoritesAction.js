var _ = require('lodash');

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

export class FavoritesAction {
  constructor(database) {
    this.database = database; 
  }

  get(user, callback) {
    knex.select('images.*').from('images').join('user_image', 'images.id', 'user_image.image_id').where({
      'user_image.user_id' : user.id
    }).then(function(rows) {
      callback(null, rows);
    });
  }

  add(user, imageId, callback) {
    this.database.connect(function(err, client, done) {
      client.query('INSERT INTO user_image (user_id, image_id) VALUES($1, $2) RETURNING image_id', [user.id, imageId], function(err, result) {
        if (err) {
          return callback(err);
        }
        done();
        callback(null, 'OK');
      });
    });
  }

  delete(user, imageId, callback) {
    this.database.query('DELETE FROM user_image WHERE user_id = $1 AND image_id = $2', [user.id, imageId], function(err, result) {
      callback(null, result);
    });
  }

}