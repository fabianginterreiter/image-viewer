var sharp = require('sharp');
var fs = require('fs');

var console = process.console;

function updateImage(client, id, callback) {
  console.time().tag('images').info('Set Update Time for Image: ' + id);
  client.query('UPDATE images SET updated_at = now() WHERE id = $1', [id], callback);
}

export class ImagesAction {
  constructor(database) {
    this.database = database; 
  }

  setRoot(root) {
    this.root = root;
  }

  get(id, callback) {
    var that = this;

    this.database.connect(function(err, client, done) {
      client.query('SELECT * FROM images WHERE id = $1', [id], function(err, result) {
        
        if (err) {
          done();
          return callback(err);
        }
        if (result.rows.length === 0) {
          done();
          return callback(null, null);
        }

        var image = result.rows[0];

        client.query('SELECT galleries.id, galleries.name FROM galleries JOIN gallery_image ON galleries.id = gallery_image.gallery_id WHERE gallery_image.image_id = $1', [id], function(err, result) {

          image.galleries = result.rows;

          client.query('SELECT id, name, path FROM directories WHERE id = $1', [image.directory_id], function(err, result) {
            image.directory = result.rows[0];

            image.fullpath = that.root + image.directory.path + image.name;

            client.query('SELECT tags.* FROM tags JOIN image_tag ON image_tag.tag_id = tags.id WHERE image_tag.image_id = $1', [id], function(err, result) {
              image.tags = result.rows;

              client.query('SELECT persons.id, persons.name, image_person.x, image_person.y FROM persons JOIN image_person ON persons.id = image_person.person_id WHERE image_person.image_id = $1;', [id], function(err, result) {
                image.persons = result.rows;
                done();
                callback(null, image);   
              });
            });
          });
        });
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