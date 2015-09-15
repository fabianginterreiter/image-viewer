"use strict"

var _ = require('lodash');

var console = process.console;

class FavoritesAction {
  constructor(knex) {
    this.knex = knex; 
  }

  get(user, callback) {
    this.knex('images').select('images.*').join('user_image', 'images.id', 'user_image.image_id').where({
      'user_image.user_id' : user.id
    }).then(function(rows) {
      _.forEach(rows, function(image) {
        image.favorite = true;
      });
      callback(null, rows);
    }).catch(function(error) {
      callback(error);
    });
  }

  add(user, imageId, callback) {
    this.knex('user_image').insert({
      'user_id' : user.id,
      'image_id' : imageId
    }).then(function(rows) {
      callback(null, 'OK');
    }).catch(function(error) {
      callback(error);
    });
  }

  delete(user, imageId, callback) {
    this.knex('user_image').where({
      'user_id' : user.id,
      'image_id' : imageId
    }).del().then(function() {
      callback(null, 'OK');
    }).catch(function(error) {
      callback(error);
    });
  }

}

module.exports = FavoritesAction;