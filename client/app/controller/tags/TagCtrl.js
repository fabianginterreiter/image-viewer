app.controller('TagCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams) {
  $http.get('/api/tags/' + $routeParams.id).success(function(data) {
    $scope.tag = data;
  });
}]);