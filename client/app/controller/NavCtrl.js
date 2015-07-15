app.controller('NavCtrl', ['$scope', '$location', function($scope, $location) {
  $scope.isActive = function(name) {
    return $location.path().startsWith('/'+name);
  };
}]);