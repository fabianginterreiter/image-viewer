"use strict"

class GetImageController {
  constructor(connection, user) {
    this.client = connection; 
  }

  get(user, id, callback) {
    var that = this;

    this.client.query('SELECT images.*, CASE WHEN user_image.user_id IS NULL THEN false ELSE true END AS favorite FROM images LEFT JOIN user_image ON images.id = user_image.image_id AND user_image.user_id = $1 WHERE id = $2', [user.id, id], function(err, result) {
      if (err) {
        return callback(err);
      }
      if (result.rows.length === 0) {
        return callback(null, null);
      }

      var image = result.rows[0];

      that.client.query('SELECT galleries.id, galleries.name FROM galleries JOIN gallery_image ON galleries.id = gallery_image.gallery_id WHERE gallery_image.image_id = $1', [id], function(err, result) {

        image.galleries = result.rows;

        that.client.query('SELECT id, name, path FROM directories WHERE id = $1', [image.directory_id], function(err, result) {
          image.directory = result.rows[0];

          image.fullpath = image.directory.path + image.name;

          that.client.query('SELECT tags.* FROM tags JOIN image_tag ON image_tag.tag_id = tags.id WHERE image_tag.image_id = $1', [id], function(err, result) {
            image.tags = result.rows;

            that.client.query('SELECT persons.id, persons.name, image_person.x, image_person.y FROM persons JOIN image_person ON persons.id = image_person.person_id WHERE image_person.image_id = $1;', [id], function(err, result) {
              image.persons = result.rows;
              callback(null, image);   
            });
          });
        });
      });
    });
  }
}

module.exports = GetImageController;