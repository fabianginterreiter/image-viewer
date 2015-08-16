var _ = require('lodash');

var console = process.console;

export class SearchImagesController {
  constructor(connection) {
    this.client = connection; 
  }

  search(options, callback) {
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

    this.client.query(query, [], function(err, result) {
      if (err) {
        callback(err);
      }
      callback(null, result.rows);
    });
  }
}