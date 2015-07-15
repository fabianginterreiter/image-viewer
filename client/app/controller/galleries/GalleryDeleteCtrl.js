app.controller('GalleryDeleteCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'GalleryService', 'Dialogs', '$location', 'usSpinnerService', function($scope, $http, $routeParams, $window, DownloadService, GalleryService, Dialogs, $location, usSpinnerService) {
  $http.get('/api/galleries/' + $routeParams.id).success(function(data) {
  	$scope.gallery = data;
    usSpinnerService.stop('browse');
  });

  $scope.deleteGallery = function() {
    Dialogs.confirm('Delete Gallery', 'Do you really want to delete this Gallery?', function() {
      $http.delete('/api/galleries/' + $scope.gallery.id).success(function() {
        if (parseInt($scope.gallery.parent_id) === 0) {
          $location.path('/galleries');  
        } else {
          $location.path('/galleries/' + $scope.gallery.parent_id);  
        }
      });  
    });
  };

  $scope.waiting = true;
  $scope.seconds = 6;

  var countDown = function() {
    $scope.seconds--;
    if ($scope.seconds > 0) {
      setTimeout(function() {
        countDown();
      }, 1000);  
    } else {
      $scope.waiting = false;
    }
    $scope.$apply();
  };

  countDown();
}]);