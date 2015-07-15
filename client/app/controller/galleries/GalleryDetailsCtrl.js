app.controller('GalleryDetailsCtrl', ['$scope', '$http', '$routeParams', '$window', 'Dialogs', '$location', 'usSpinnerService', function($scope, $http, $routeParams, $window, Dialogs, $location, usSpinnerService) {
  $scope.imagesWithGps = 0;
  $scope.imagesWithoutGps = 0;

  $http.get('/api/galleries/' + $routeParams.id).success(function(data) {
  	$scope.gallery = data;

    _.forEach(data.images, function(image) {
      if (image.gps) {
        $scope.imagesWithGps++;
      } else {
        $scope.imagesWithoutGps++;
      }
    });
  });

  $http.get('/api/galleries/' + $routeParams.id + '/directories').success(function(data) {
  	$scope.directories = data;
  });

  $http.get('/api/galleries/' + $routeParams.id + '/tags').success(function(data) {
  	$scope.tags = data;
  });

  $http.get('/api/galleries/' + $routeParams.id + '/persons').success(function(data) {
  	$scope.persons = data;
  });
}]);