app.controller('GalleryViewerCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
  $http.get('/api/galleries/' + $routeParams.gallery_id).success(function(data) {
  	$scope.gallery = data;
    if ($scope.image) {
      usSpinnerService.stop('browse');
    }
  });

  $http.get('/api/images/' + $routeParams.id).success(function(data) {
  	$scope.image = data;
    if ($scope.gallery) {
      usSpinnerService.stop('browse');
    }
  });
}]);