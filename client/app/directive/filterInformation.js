app.directive('filterInformation', function() {
  return {
    controller : function($scope, $http, $routeParams) {
      var id = $routeParams.id;
      $scope.id = id;
      var person = $routeParams.personId;
      var tag = $routeParams.tagId;
      var directory = $routeParams.directoryId;

      if (person) {
        $http.get('/api/' + $scope.type + '/' + id + '/persons/' + person).success(function(data) {
          $scope.person = data;
        });
      }

      if (directory) {
        $http.get('/api/' + $scope.type + '/' + id + '/directories/' + directory).success(function(data) {
          $scope.directory = data;
        }); 
      }

      if (tag) {
        $http.get('/api/' + $scope.type + '/' + id + '/tags/' + tag).success(function(data) {
          $scope.tag = data;
        }); 
      }

      if ($routeParams.gps) {
        $scope.gps = true;
        $scope.gpsValue = $routeParams.gps === 'true';
      }
    },

    scope: {
      type : '=type'
    },

    templateUrl : 'templates/directives/filterInformation.html'
  };
});