"use strict"

var config = require('config');

module.exports = require('knex')({
  client: 'postgres',
  connection: {
    host     : config.get('database').host,
    user     : config.get('database').user,
    password : config.get('database').password,
    database : config.get('database').database
  }
});