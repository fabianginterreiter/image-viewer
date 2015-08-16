var sharp = require('sharp');
var fs = require('fs');
var _ = require('lodash');

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

  getImages(action, options, callback) {
    switch (action) {
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
        var conditions = [];
        conditions.push('1 = 1');

        if (options.persons) {
          var personIds = options.persons.split(',');
          _.forEach(personIds, function(id) {
            conditions.push('EXISTS (SELECT 1 FROM image_person WHERE images.id = image_person.image_id AND image_person.person_id = ' + id + ')');
          });

          if (options.personsOnly === 'true') {
            conditions.push('EXISTS (SELECT 1 FROM image_person WHERE image_person.image_id = images.id GROUP BY image_person.image_id HAVING count(image_person.image_id) = ' + personIds.length + ')');
          }
        } else if (options.personsOnly === 'true') {
          conditions.push('NOT EXISTS (SELECT 1 FROM image_person WHERE image_person.image_id = images.id)');
        }

        console.tag('Search').time().info('Search!!!');

        if (options.tags) {
          var tagIds = options.tags.split(',');
          _.forEach(tagIds, function(id) {
            conditions.push('EXISTS (SELECT 1 FROM image_tag WHERE images.id = image_tag.image_id AND image_tag.tag_id = ' + id + ')');
          });

          if (options.tagsOnly === 'true') {
            conditions.push('EXISTS (SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id GROUP BY image_tag.image_id HAVING count(image_tag.image_id) = ' + tagIds.length + ')');
          }
        } else if (options.tagsOnly === 'true') {
          conditions.push('NOT EXISTS (SELECT 1 FROM image_tag WHERE image_tag.image_id = images.id)');
        }

        if (options.galleries) {
          var galleryIds = options.galleries.split(',');
          _.forEach(galleryIds, function(id) {
            conditions.push('EXISTS (SELECT 1 FROM gallery_image WHERE images.id = gallery_image.image_id AND gallery_image.gallery_id = ' + id + ')');
          });

          if (options.galleriesOnly === 'true') {
            conditions.push('EXISTS (SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id GROUP BY gallery_image.image_id HAVING count(gallery_image.image_id) = ' + galleryIds.length + ')');
          }
        } else if (options.galleriesOnly === 'true') {
          conditions.push('NOT EXISTS (SELECT 1 FROM gallery_image WHERE gallery_image.image_id = images.id)');
        }

        if (options.minDate) {
          conditions.push('\''+options.minDate+'\' <= images.created_at');
        }

        if (options.maxDate) {
          conditions.push('\''+options.maxDate+'\' >= images.created_at');
        }

        var query = 'SELECT images.* FROM images WHERE ' + conditions.join(' AND ') + ' ORDER BY images.created_at LIMIT 200';

        console.time().tag('Search').info(query);

        this.database.connect(function(err, client, done) {
          client.query(query, [], function(err, result) {
            if (err) {
              done();
              callback(err);
            }
            done();
            callback(null, result.rows);
          });
        });
        break;
      default:
        callback(null, []);
    }
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