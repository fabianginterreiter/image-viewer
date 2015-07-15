app.controller('TagCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService) {
  $http.get('/api/tags/' + $routeParams.id).success(function(data) {
  	$scope.tag = data;
  });
}]);