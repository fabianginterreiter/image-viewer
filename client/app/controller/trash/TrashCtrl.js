app.controller('TrashCtrl', ['$scope', '$http', function($scope, $http) {
  $http.get('/api/trash').success(function(data) {
    $scope.images = data;
  });
}]);