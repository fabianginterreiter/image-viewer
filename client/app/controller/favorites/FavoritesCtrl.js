app.controller('FavoritesCtrl', ['$scope', '$http', 'SessionService', '$timeout', function($scope, $http, SessionService, $timeout) {
  $http.get('/api/favorites').success(function(data) {
    $scope.images = data;
  });
}]);
