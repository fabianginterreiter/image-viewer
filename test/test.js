import { equal } from 'assert';

import { TagController } from '../controllers/tag';

describe('Tags', function() {
  describe('Getting a Tag', function() {
    it('Should return error in case of Database error.', () => {
      new TagController({
        connect : function(callback) {
          callback("error");
        }
      }).get(1, function(err, call) {
        equal(err, "error");
      });
    });

    it('Should return a list of tags and images', () => {
      new TagController({
        connect : function(callback) {
          callback(null, function() {
            
          }, function() {

          });
        }
      }).get(1, function(err, call) {
        equal(err, null);
      });
    });
  });
});