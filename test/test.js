import { equal } from 'assert';

import { TagController } from '../controllers/tag';

describe('Tags', function() {
  describe('Getting a Tag', function() {
    var knex = require('knex')({
      client: 'sqlite3',
      debug: true,
      connection: {
        filename: ':memory:'
      }
    });

    knex.schema.createTable('users', function (table) {
      table.increments();
      table.string('name');
      table.timestamps();
    }).createTable('accounts', function(table) {
      table.increments('id');
      table.string('account_name');
      table.integer('user_id').unsigned().references('users.id');
    }).then(function() {
      return knex.insert({
        'name' : 'Fabian'
      }).into('users');
    }).then(function() {
      console.log("select");
      return knex('users').select('name').then(function(rows) {
        console.log(rows);
      });
    });

    it('Should return error in case of Database error.', () => {
      new TagController({
        connect : function(callback) {
          callback("error");
        }
      }).get(1, function(err, call) {
        equal(err, "error");
      });
    });
  });
});