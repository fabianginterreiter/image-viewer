var console = process.console;

export class PersonsAction {
  constructor(database) {
    this.database = database; 
  }

  getAll(query, callback) {
    this.database.connect(function(err, client, done) {
    	if (query) {
        client.query('SELECT persons.* FROM persons JOIN image_person ON persons.id = image_person.person_id WHERE LOWER(persons.name) LIKE LOWER($1) GROUP BY persons.id ORDER BY count(persons.id) DESC', ['%' + query + '%'], function(err, result) {
          done();
          callback(null, result.rows);
        }); 
    	} else {
    	  client.query('SELECT persons.id, persons.name, count(persons) AS count FROM persons JOIN image_person ON image_person.person_id = persons.id GROUP BY persons.id ORDER BY count DESC;', [], function(err, result) {
          done();
          callback(null, result.rows);
        });	
    	}
    });
  }

  get(id, callback) {
    console.time().tag('PersonsAction').info('Get Person' + id);
    this.database.connect(function(err, client, done) {
      client.query('SELECT * FROM persons WHERE id = $1', [id], function(err, result) {
        var person = result.rows[0];
        client.query('SELECT images.* FROM images JOIN image_person ON images.id = image_person.image_id WHERE image_person.person_id = $1 ORDER BY images.created_at, images.name', [id], function(err, result) {
          done();
          person.images = result.rows;
          callback(null, person);
        });
      });
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
}