var sharp = require('sharp');
var fs = require('fs');

var console = process.console;

function updateImage(client, id, callback) {
  console.time().tag('images').info('Set Update Time for Image: ' + id);
  client.query('UPDATE images SET updated_at = now() WHERE id = $1', [id], callback);
}

import { GetImageController } from '../controllers/images/GetImageController';

export class ImagesAction {
  constructor(database) {
    this.database = database; 
  }

  setRoot(root) {
    this.root = root;
  }



  get(id, callback) {
    this.database.connect(function(err, client, done) {
      new GetImageController(client).get(id, function(err, result) {
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
}