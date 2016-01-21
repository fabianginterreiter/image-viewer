app.controller('SetPersonImageCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', 'PersonService', 'FilterService', 'ImageViewerService', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService, PersonService, FilterService, ImageViewerService) {
  ImageViewerService.open();

  $http.get('/api/persons/' + $routeParams.id).success(function(data) {
    $scope.person = data;
  });

  $http.get('/api/images/' + $routeParams.imageId).success(function(image) {
    $scope.image = image;
  });

  $scope.imageId = $routeParams.imageId;

  $scope.obj = {}

  // The url or the data64 for the image
  $scope.obj.src = '/api/images/' + $routeParams.imageId + '/resize';

  // Must be [x, y, x2, y2, w, h]
  $scope.obj.coords = [0, 0, 100, 100, 100, 100];

  // You can add a thumbnail if you want
  $scope.obj.thumbnail = false;

  $scope.save = function() {
    console.log($scope.obj);

    var x = $scope.obj.coords[0];
    var y = $scope.obj.coords[1];

    var w = $scope.obj.coords[4];
    var h = $scope.obj.coords[5];

    console.log(x + '#' + y + '#' + w + '#' + h);

    $http.put('/api/persons/' + $routeParams.id + '/image/' + $routeParams.imageId + '?x=' + x + '&y=' + y + '&w=' + w + '&h=' + h).success(function(data) {
      $location.path('/persons/' + $routeParams.id);
    });
  };
}]);
