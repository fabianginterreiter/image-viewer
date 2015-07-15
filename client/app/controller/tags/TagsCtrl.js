app.controller('TagsCtrl', ['$scope', '$http', function($scope, $http) {
  $http.get('/api/tags/').success(function(data) {
    $scope.tags = data;
  });
}]);