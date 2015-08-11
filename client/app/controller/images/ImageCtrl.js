

app.controller('ImageCtrl', ['$scope', '$http', '$routeParams', 'ImageViewerService', function($scope, $http, $routeParams, ImageViewerService) {
  ImageViewerService.open();

  $scope.id = $routeParams.id;

  $scope.width = angular.element('#image').width();

  window.onresize = function() {
  	$scope.width = angular.element('#image').width();
  	$scope.$apply();
  };

  $http.get('/api/images/' + $routeParams.id).success(function(data) {
  	$scope.image = data;
  });
  
}]);