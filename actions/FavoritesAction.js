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
    knex('images').select('images.*').join('user_image', 'images.id', 'user_image.image_id').where({
      'user_image.user_id' : user.id
    }).then(function(rows) {
      callback(null, rows);
    }).catch(function(error) {
      callback(error);
    });
  }

  add(user, imageId, callback) {
    knex('user_image').insert({
      'user_id' : user.id,
      'image_id' : imageId
    }).then(function(rows) {
      callback(null, 'OK');
    }).catch(function(error) {
      callback(error);
    });
  }

  delete(user, imageId, callback) {
    knex('user_image').where({
      'user_id' : user.id,
      'image_id' : imageId
    }).del().then(function() {
      callback(null, 'OK');
    }).catch(function(error) {
      callback(error);
    });
  }

}