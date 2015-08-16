app.controller('SetPersonImageCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', 'PersonService', 'FilterService', 'ImageViewerService', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService, PersonService, FilterService, ImageViewerService) {
  ImageViewerService.open();

  $http.get('/api/persons/' + $routeParams.id).success(function(data) {
  	$scope.person = data;
  });

  $scope.imageId = $routeParams.imageId;
}]);