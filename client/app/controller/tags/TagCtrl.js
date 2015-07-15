app.controller('TagCtrl', ['$scope', '$http', function($scope, $http) {
  $http.get('/api/tags/' + $routeParams.id).success(function(data) {
    $scope.tag = data;
  });
}]);