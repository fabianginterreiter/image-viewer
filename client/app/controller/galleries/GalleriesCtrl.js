app.controller('GalleriesCtrl', ['$scope', '$http', 'GalleryService', function($scope, $http, GalleryService) {
  $http.get('/api/galleries').success(function(data) {
    $scope.galleries = data;
  });

  $scope.create = function() {
    GalleryService.create([]);
  };
}]);
