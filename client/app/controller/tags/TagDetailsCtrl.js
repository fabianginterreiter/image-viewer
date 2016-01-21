app.controller('TagDetailsCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, TagService, Dialogs, $location) {
  $http.get('/api/tags/' + $routeParams.id).success(function(data) {
    $scope.tag = data;
  });
}]);
