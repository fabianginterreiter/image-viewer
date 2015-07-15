app.controller('TagsCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService) {
	$http.get('/api/tags/').success(function(data) {
  	$scope.tags = data;
  });
}]);