app.controller('ImageCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
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