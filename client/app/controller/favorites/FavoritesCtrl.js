app.controller('FavoritesCtrl', ['$scope', '$http', 'SessionService', function($scope, $http, SessionService) {
  $http.get('/api/favorites').success(function(data) {
    $scope.images = data;
  });
}]);