app.controller('GalleryDetailsCtrl', ['$scope', '$http', '$routeParams', '$window', 'Dialogs', '$location', 'usSpinnerService', function($scope, $http, $routeParams, $window, Dialogs, $location, usSpinnerService) {
  $http.get('/api/galleries/' + $routeParams.id).success(function(data) {
    $scope.gallery = data;
  });
}]);
