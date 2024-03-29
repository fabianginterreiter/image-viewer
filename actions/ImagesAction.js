"use strict"

var sharp = require('sharp');
var fs = require('fs');
var _ = require('lodash');
var GetImageController = require('../controllers/images/GetImageController');
var SearchImagesController = require('../controllers/images/SearchImagesController');

var console = process.console;

function updateImage(client, id, callback) {
  console.time().tag('images').info('Set Update Time for Image: ' + id);
  client.query('UPDATE images SET updated_at = now() WHERE id = $1', [id], callback);
}


class ImagesAction {
  constructor(database, knex) {
    this.database = database; 
    this.knex = knex;
  }

  setRoot(root) {
    this.root = root;
  }

  getImages(action, options, callback) {
    switch (action) {
      case 'coordinates':
        this.database.query('SELECT * FROM images WHERE (longitude BETWEEN $1 AND $3) AND (latitude BETWEEN $2 AND $4)', [
          options.lon1, options.lat1, options.lon2, options.lat2
          ], function(err, result) {
          callback(null, result);
        });
        break;
      case 'random':
        var limit = options.limit ? options.limit : '10';
        if (options.used) {
          if (options.used === 'true') {
            this.database.query('SELECT * FROM images WHERE (EXISTS(SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id) OR EXISTS(SELECT 1 FROM image_person WHERE image_person.image_id = images.id) OR EXISTS(SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id)) ORDER BY random() LIMIT $1;', [limit], function(err, result) {
              callback(null, result);
            });
          } else {
            this.database.query('SELECT * FROM images WHERE NOT EXISTS(SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id) AND NOT EXISTS(SELECT 1 FROM image_person WHERE image_person.image_id = images.id) AND NOT EXISTS(SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id) ORDER BY random() LIMIT $1;', [limit], function(err, result) {
              callback(null, result);
            });
          }
        } else {
          this.database.query('SELECT * FROM images ORDER BY random() LIMIT $1;', [limit], function(err, result) {
            callback(null, result);
          });
        }
        break;
      case 'marked':
        this.database.query('SELECT images.*, count(images.id) as count FROM images JOIN image_person ON images.id = image_person.image_id GROUP BY images.id ORDER BY count DESC LIMIT 30;', [], function(err, result) {
          callback(null, result);
        });
        break;
      case 'newest':
        this.database.query('SELECT * FROM images ORDER BY added_at DESC LIMIT 10', [], function(err, result) {
          callback(null, result);
        });
        break;
      case 'updated':
        this.database.query('SELECT * FROM images ORDER BY updated_at DESC LIMIT 10', [], function(err, result) {
          callback(null, result);
        });
        break;
      case 'search':
        this.database.connect(function(err, client, done) {
          new SearchImagesController(client).search(options, function (err, result) {
            done();
            callback(null, result);
          });
        });
        break;
      default:
        callback(null, []);
    }
  }

  get(user, id, callback) {
    this.database.connect(function(err, client, done) {
      new GetImageController(client).get(user, id, function(err, result) {
        done();
        callback(null, result);
      });
    });
  }

  addPerson(id, person, callback) {
    this.database.connect(function(err, client, done) {
      updateImage(client, id, function(err) {
        client.query('SELECT id FROM persons WHERE name LIKE $1', [person.name], function(err, result) {
          if (result.rows.length === 1) {
            person.id = result.rows[0].id;

            client.query('INSERT INTO image_person(image_id, person_id, x, y) VALUES($1, $2, $3, $4)', 
              [id, person.id, person.x, person.y],function(err, result) {
                done();
                callback(null, person);
            });
          } else {
            client.query('INSERT INTO persons(name) VALUES($1) RETURNING id', [person.name], function(err, result) {
              person.id = result.rows[0].id;

              client.query('INSERT INTO image_person(image_id, person_id, x, y) VALUES($1, $2, $3, $4)', 
                [id, person.id, person.x, person.y],function(err, result) {
                  done();
                  callback(null, person);
              });
            });
          }
        });
      });
    });
  }

  resize(id, width, height, min, callback) {
    var that = this;

    this.database.connect(function(err, client, done) {
      client.query('SELECT directories.path || images.name AS path FROM images JOIN directories ON images.directory_id = directories.id WHERE images.id = $1', [id], function(err, result) {
        done();

        var transformer = sharp().withMetadata().rotate();

        if (width > 0 || height > 0) {
          transformer.resize(width, height);
        }

        if (min === 'true') {
          transformer.min();
          console.log("min");
        } else {
          transformer.max();
          console.log("max");
        }

        callback(null, fs.createReadStream(that.root + result.rows[0].path).pipe(transformer));
      });
    });
  }

  getRelated(id, options, callback) {
    if (!options.limit) {
      options.limit = 20;
    }

    var relatedImagesByTag = this.knex.select('rt.image_id AS id').from('image_tag AS it').join('image_tag AS rt', 'it.tag_id', 'rt.tag_id').where({
        'it.image_id' : id
      }).whereNot({
        'rt.image_id' : id
      }).as('ids');

      var relatedImagesByPerson = this.knex.select('rt.image_id AS id').from('image_person AS it').join('image_person AS rt', 'it.person_id', 'rt.person_id').where({
          'it.image_id' : id
        }).whereNot({
          'rt.image_id' : id
        });

    var relatedImagesByGallery = this.knex.select('rt.image_id AS id').from('gallery_image AS it').join('gallery_image AS rt', 'it.gallery_id', 'rt.gallery_id').where({
       'it.image_id' : id
        }).whereNot({
          'rt.image_id' : id
        });

    var relatedImagesByDirectory = this.knex.select('rt.id AS id').from('images AS it').join('images AS rt', 'it.directory_id', 'rt.directory_id').where({
       'it.id' : id
        }).whereNot({
          'rt.id' : id
        });


    this.knex('images').select('images.*').whereIn(
      'id',
      this.knex.select('ids.id').from(
        relatedImagesByTag
          .unionAll(relatedImagesByPerson)
          .unionAll(relatedImagesByGallery)
          .unionAll(relatedImagesByDirectory)
      )
      .groupBy('ids.id')
      .orderByRaw('count("ids"."id") DESC')
      .limit(options.limit)
    ).then(function(rows) {
      callback(null, rows);
    }).catch(function(error) {
      callback(error);
    });
  }
}

module.exports = ImagesAction;