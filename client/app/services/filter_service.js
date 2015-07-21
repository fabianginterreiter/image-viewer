app.factory('FilterService', function() {
  return {
    filter : function(http, routeParams, type, callback) {
      var id = routeParams.id;
      console.log("muh");
      http.get('/api/' + type + '/' + id).success(function(object) {
        if (routeParams.personId) {
          console.log('/api/' + type + '/' + id + '/persons/' + routeParams.personId + '/images');
          http.get('/api/' + type + '/' + id + '/persons/' + routeParams.personId + '/images').success(function(images) {
            object.images = images;
            callback(null, object);
          });
        } else if (routeParams.directoryId) {
          http.get('/api/' + type + '/' + id + '/directories/' + routeParams.directoryId + '/images').success(function(images) {
            object.images = images;
            callback(null, object);
          });
        } else if (routeParams.tagId) {
          http.get('/api/' + type + '/' + id + '/tags/' + routeParams.tagId + '/images').success(function(images) {
            object.images = images;
            callback(null, object);
          });
        } else if (routeParams.gps) {
          gpsValue = routeParams.gps === 'true';
          http.get('/api/' + type + '/' + id + '/images?gps=' + gpsValue).success(function(images) {
            object.images = images;
            callback(null, object);
          });
        } else {
          callback(null, object);
        }
      });
    }
  };
});