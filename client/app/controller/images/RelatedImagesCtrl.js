app.controller('RelatedImagesCtrl', ['$scope', '$http', '$routeParams', 'ImageViewerService', function($scope, $http, $routeParams, ImageViewerService) {
  ImageViewerService.open();

  $scope.id = $routeParams.id;

  $http.get('/api/images/' + $routeParams.id).success(function(data) {
  	$scope.image = data;
  });

  $http.get('/api/images/' + $routeParams.id + '/related?limit=100').success(function(data) {
    $scope.related = data;
  });
  
}]);