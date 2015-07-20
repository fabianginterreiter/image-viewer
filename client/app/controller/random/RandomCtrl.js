app.controller('RandomCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', 'PersonService', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService, PersonService) {
  $http.get('/api/images?action=random&limit=50').success(function(data) {
    $scope.images = data;
  });
}]);