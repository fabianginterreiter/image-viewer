var database = require('../utils/Database');
var console = process.console;

class TagController {
  get(id, callback) {
    var that = this;

    database.connect(function(err, client, done) {
      if (err) {
        return callback(err);
      }

      client.query('SELECT * FROM tags WHERE id = $1', [id], function(err, result) {
        if (err) {
          done();
          return callback(err);
        }

        if (result.rows.length === 0) {
          done();
          return callback(null, null);
        }

        var tag = result.rows[0];

        that.getImages(id, client, function(err, images) {
          done();
          if (err) {
            return callback(err);
          }
          
          tag.images = images;
          
          callback(null, tag);
        });
      });
    });
  }

  getImages(id, client, callback) {
    client.query('SELECT images.* FROM images JOIN image_tag ON images.id = image_tag.image_id WHERE image_tag.tag_id = $1 ORDER BY images.created_at', [id], function(err, result) {
      if (err) {
        return callback(err);
      }

      callback(null, result.rows);
    });
  }
}

export default new TagController();