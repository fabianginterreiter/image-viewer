app.factory('FilterService', function() {
  return {
    filter : function(http, routeParams, type, callback) {

      var filter = false;

      if (routeParams.personId || routeParams.directoryId || routeParams.tagId || routeParams.gps) {
        filter = true;
      }

      var id = routeParams.id ? routeParams.id : 0;

      http.get('/api/' + type + '/' + id + '?images=' + (filter ? 'false' : 'true')).success(function(object) {
        if (routeParams.personId) {
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