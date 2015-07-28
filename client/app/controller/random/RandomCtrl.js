app.controller('RandomCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', 'PersonService', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService, PersonService) {

  if ($routeParams.used === 'true') {
    $http.get('/api/images?action=random&limit=50&used=true').success(function(data) {
      $scope.images = data;
    });  
  } else if ($routeParams.used === 'false') {
    $http.get('/api/images?action=random&limit=50&used=false').success(function(data) {
      $scope.images = data;
    });  
  } else {
    $http.get('/api/images?action=random&limit=50').success(function(data) {
      $scope.images = data;
    });  
  }
}]);