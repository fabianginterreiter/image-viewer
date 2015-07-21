app.controller('TagDetailsCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, TagService, Dialogs, $location) {
  $scope.imagesWithGps = 0;
  $scope.imagesWithoutGps = 0;
  
  $http.get('/api/tags/' + $routeParams.id).success(function(data) {
    $scope.tag = data;

    _.forEach(data.images, function(image) {
      if (image.gps) {
        $scope.imagesWithGps++;
      } else {
        $scope.imagesWithoutGps++;
      }
    });
  });

  $http.get('/api/tags/' + $routeParams.id + '/persons').success(function(data) {
    $scope.persons = data;
  });
}]);