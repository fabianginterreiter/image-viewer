app.directive('statistics', function() {
  return {
    controller : function($scope, $http) {
      $scope.imagesWithGps = 0;
      $scope.imagesWithoutGps = 0;

      $scope.$watch('object', function(object) {
        if (!object) {
          return;
        }

        _.forEach(object.images, function(image) {
          if (image.gps) {
            $scope.imagesWithGps++;
          } else {
            $scope.imagesWithoutGps++;
          }
        });

        $http.get('/api/' + $scope.type + '/' + object.id + '/persons').success(function(data) {
          $scope.persons = data;
        });

        $http.get('/api/' + $scope.type + '/' + object.id + '/directories').success(function(data) {
          $scope.directories = data;
        });

        $http.get('/api/' + $scope.type + '/' + object.id + '/tags').success(function(data) {
          $scope.tags = data;
        });
      });
    },

    scope: {
      object : '=object',
      type : '=type'
    },

    templateUrl : 'templates/directives/statistics.html'
  };
});