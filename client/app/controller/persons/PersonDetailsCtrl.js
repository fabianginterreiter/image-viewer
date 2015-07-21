app.controller('PersonDetailsCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', 'PersonService', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService, PersonService) {
  $http.get('/api/persons/' + $routeParams.id).success(function(data) {
  	$scope.person = data;
  });
}]);