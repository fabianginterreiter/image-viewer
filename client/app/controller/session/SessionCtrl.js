app.controller('SessionCtrl', ['$scope', '$http', 'SessionService', function($scope, $http, SessionService) {

  SessionService.watch(function(user) {
    if (user) {
      $scope.user = user;
      $scope.name = user.name;      
    }
  });

  $scope.change = function() {
  	SessionService.delete();
  }
}]);