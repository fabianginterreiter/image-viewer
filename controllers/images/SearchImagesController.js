var _ = require('lodash');

var console = process.console;

export class SearchImagesController {
  constructor(connection) {
    this.client = connection; 
  }

  extendConditionForPersons(conditions, options) {
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
  }

  extendConditionForTags(conditions, options) {
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
  }

  extendConditionForGalleries(conditions, options) {
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
  }

  extendConditionForMinDate(conditions, options) {
    if (options.minDate) {
      conditions.push('\''+options.minDate+'\' <= images.created_at');
    }
  }

  extendConditionForMaxDate(conditions, options) {
    if (options.maxDate) {
      conditions.push('\''+options.maxDate+'\' >= images.created_at');
    }
  }

  extendConditionsForQuery(conditions, options) {
    if (options.query && options.query.length > 0) {
      var q = options.query;

      var queryConditions = [];

      queryConditions.push('name LIKE \'%' + q + '%\'');

      queryConditions.push('EXISTS (SELECT 1 FROM image_tag JOIN tags ON image_tag.tag_id = tags.id WHERE text LIKE \'%' + q +'%\' AND images.id = image_tag.image_id)');

      conditions.push('(' + queryConditions.join(' OR ') + ')');
    }
  }

  search(options, callback) {
  	var conditions = [];
    conditions.push('1 = 1');

    this.extendConditionForPersons(conditions, options);
    this.extendConditionForTags(conditions, options);
    this.extendConditionForGalleries(conditions, options);
    
    this.extendConditionForMinDate(conditions, options);
    this.extendConditionForMaxDate(conditions, options);

    this.extendConditionsForQuery(conditions, options);

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