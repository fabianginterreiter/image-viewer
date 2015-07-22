app.controller('DirectoryDetailsCtrl', ['$scope', '$http', '$routeParams', '$window', 'Dialogs', '$location', 'usSpinnerService', function($scope, $http, $routeParams, $window, Dialogs, $location, usSpinnerService) {
  $http.get('/api/directories/' + $routeParams.id).success(function(data) {
  	$scope.directory = data;
  });
}]);