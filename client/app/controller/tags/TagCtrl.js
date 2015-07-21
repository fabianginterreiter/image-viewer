app.factory('TagService', function($modal, $http, Dialogs) {
  return {
    edit : function(tag, callback) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/tags/edit.html',
        controller: function ($scope, $modalInstance, $http) {

          $scope.text = tag.text;

          $scope.save = function () {
            tag.text = $scope.text;

            $http.put('/api/tags/' + tag.id, tag).success(function(result) {
              $modalInstance.close();
            });
          };

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        }
      });
    }
  }
});

app.factory('FilterService', function() {
  return {
    filter : function(http, routeParams, type, callback) {
      var id = routeParams.id;
      http.get('/api/' + type + '/' + id).success(function(object) {
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

app.controller('TagCtrl', ['$scope', '$http', '$routeParams', 'TagService', 'Dialogs', '$location', 'FilterService', function($scope, $http, $routeParams, TagService, Dialogs, $location, FilterService) {
  var id = $routeParams.id;

  FilterService.filter($http, $routeParams, 'tags', function(err, tag) {
      $scope.tag = tag;
    });

  $scope.edit = function() {
  	TagService.edit($scope.tag);
  };

  $scope.delete = function() {
    Dialogs.delete('Delete', 'Do you really want to delete: ' + $scope.tag.text, function() {
      $http.delete('/api/tags/' + $scope.tag.id).success(function() {
        $location.path('/tags');
      });
    });
  };
}]);