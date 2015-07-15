app.controller('GalleriesCtrl', ['$scope', '$http', '$routeParams', 'GalleryService', function($scope, $http, $routeParams, GalleryService) {
  $http.get('/api/galleries').success(function(data) {
  	$scope.galleries = data;
  });

  $scope.create = function() {
  	GalleryService.create([]);
  };
}]);