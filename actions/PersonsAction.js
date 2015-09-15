"use strict"

var sharp = require('sharp');
var fs = require('fs');
var _ = require('lodash');

var console = process.console;

class PersonsAction {
  constructor(database, knex) {
    this.database = database; 
    this.knex = knex;
  }

  setRoot(root) {
    this.root = root;
  }

  getAll(query, callback) {
    if (query) {
      this.database.connect(function(err, client, done) {
        client.query('SELECT persons.* FROM persons JOIN image_person ON persons.id = image_person.person_id WHERE LOWER(persons.name) LIKE LOWER($1) GROUP BY persons.id ORDER BY count(persons.id) DESC', ['%' + query + '%'], function(err, result) {
          done();
          callback(null, result.rows);
        }); 
      });
    } else {
      this.knex('persons').select('persons.id', 'persons.name', 'persons.image_id')
        .count('persons as count')
        .join('image_person', 'image_person.person_id', 'persons.id')
        .groupBy('persons.id')
        .orderBy('count', 'desc').then(function(rows) {
          callback(null, rows);
        }).catch(function(error) {
          callback(error);
        });
    }
  }

  get(user, id, callback) {
    var person = null;
    var knex = this.knex;
    this.knex('persons').where({
      'id' : id
    }).then(function(rows) {
      person = rows[0];
      return knex('images').select('images.*')
        /*.select(knex.raw('CASE WHEN "user_image"."user_id" IS NULL THEN false ELSE true END AS favorite'))
        .leftJoin('user_image', function() {
          this.on('user_image.image_id', 'images.id')
            .on('user_image.user_id', user.id);
        })*/
        .join('image_person', 'images.id', 'image_person.image_id')
        .where({
          'image_person.person_id' : id
        }).orderBy('images.created_at');
    }).then(function(rows) {
      person.images = rows;
      callback(null, person);
    }).catch(function(error) {
      callback(error);
    });
  }

  getImages(id, gps, callback) {
    var gpsCondition = '';
    if (gps && gps.length > 0) {
      gpsCondition = ' AND gps = ' + gps;
    }

    this.database.connect(function(err, client, done) {
      client.query('SELECT images.* FROM image_person JOIN images ON image_person.image_id = images.id WHERE image_person.person_id = $1' + gpsCondition + ' ORDER BY images.created_at', [id], function(err, result) {
        done();
        callback(null, result.rows);
      });
    });
  }

  update(id, person, callback) {
    this.database.connect(function(err, client, done) {
      client.query('UPDATE persons SET name = $1 WHERE id = $2', [person.name, id], function(err, result) {
        done();
        callback(null, "OK");
      });
    });
  }

  setImage(id, imageId, left, top, width, height, callback) {
    var that = this;
    this.database.connect(function(err, client, done) {
      client.query('SELECT directories.path || images.name AS path FROM images JOIN directories ON images.directory_id = directories.id WHERE images.id = $1', [imageId], function(err, result) {
        sharp(that.root + result.rows[0].path).rotate()
          .extract(top, left, width, height)
          .resize(300, 300).max()
          .toFile('persons/' + id + '.png', function(err) {
            if (err) {
              console.time().tag('image').info(err);
              return client.query('UPDATE persons SET image_id = null WHERE id = $2', [imageId, id], function(err2, result) {
                done();              
                callback(err);
              });
            }

            client.query('UPDATE persons SET image_id = $1 WHERE id = $2', [imageId, id], function(err, result) {
              done();
              callback(null, 'OK');
            });
          });    
      });
    });
  }

  delete(id, callback) {
    this.database.connect(function(err, client, done) {
      client.query('DELETE FROM persons WHERE id = $1', [id], function(err, result) {
        done();
        callback(null, 'OK');
      });
    });
  }

  getPersons(id, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT pa.*, count(pa) as count FROM persons pa JOIN image_person ipa ON pa.id = ipa.person_id JOIN image_person ipp ON ipa.image_id = ipp.image_id WHERE ipp.person_id = $1 AND ipa.person_id != $1 GROUP BY pa.id ORDER BY count DESC', [id], function(err, result) {
        done();
        callback(null, result.rows);
      });
    });
  }

  getPersonDetails(id, personId, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT * FROM persons WHERE id = $1', [personId], function(err, result) {
        done();
        callback(null, result.rows[0]);
      });
    });
  }

  getPersonImages(id, personId, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT i.* FROM images i JOIN image_person ipa ON ipa.image_id = i.id JOIN image_person ipp ON ipp.image_id = ipa.image_id WHERE ipp.person_id = $1 AND ipa.person_id = $2 ORDER BY i.created_at', [id, personId], function(err, result) {
        done();
        callback(null, result.rows);
      });
    });
  }

  getTags(id, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT tags.*, count(tags.id) AS count FROM tags JOIN image_tag ON tags.id = image_tag.tag_id JOIN image_person ON image_tag.image_id = image_person.image_id WHERE image_person.person_id = $1 GROUP BY tags.id ORDER BY count DESC;', [id], function(err, result) {
        done();
        callback(null, result.rows);
      });
    });
  }

  getTagDetails(id, tagId, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT * FROM tags WHERE id = $1', [tagId], function(err, result) {
        done();
        callback(null, result.rows[0]);
      });
    });
  }

  getTagImages(id, tagId, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id JOIN image_tag ON image_tag.image_id = images.id WHERE image_person.person_id = $1 AND image_tag.tag_id = $2 ORDER BY images.created_at;', [id, tagId], function(err, result) {
        done();
        callback(null, result.rows);
      });
    });
  }

  getDirectories(id, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT directories.id, directories.name, count(directories.id) FROM directories JOIN images ON directories.id = images.directory_id JOIN image_person ON images.id = image_person.image_id WHERE image_person.person_id = $1 GROUP BY directories.id ORDER BY count DESC', [id], function(err, result) {
        done();
        callback(null, result.rows);
      });
    });
  }

  getDirectoryDetails(id, directoryId, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT * FROM directories WHERE id = $1', [directoryId], function(err, result) {
        done();
        callback(null, result.rows[0]);
      });
    });
  }

  getDirectoryImages(id, directoryId, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id WHERE images.directory_id = $2 AND image_person.person_id = $1 ORDER BY images.created_at;;', [id, directoryId], function(err, result) {
        done();
        callback(null, result.rows);
      });
    });
  }

  getGalleries(id, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT galleries.*, count(galleries.id) AS count FROM galleries JOIN gallery_image ON galleries.id = gallery_image.gallery_id JOIN image_person ON gallery_image.image_id = image_person.image_id WHERE image_person.person_id = $1 GROUP BY galleries.id ORDER BY count DESC;', [id], function(err, result) {
        done();
        callback(null, result.rows);
      });
    });
  }

  getGalleryDetails(id, galleryId, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT * FROM galleries WHERE id = $1;', [galleryId], function(err, result) {
        done();
        callback(null, result.rows[0]);
      });
    });
  }

  getGalleryImages(id, galleryId, callback) {
    this.database.connect(function(err, client, done) {
      client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id JOIN gallery_image ON gallery_image.image_id = images.id WHERE image_person.person_id = $1 AND gallery_image.gallery_id = $2 ORDER BY images.created_at;', [id, galleryId], function(err, result) {
        done();
        callback(null, result.rows);
      });
    });
  }
}

module.exports = PersonsAction;