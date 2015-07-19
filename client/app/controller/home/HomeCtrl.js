app.controller('HomeCtrl', ['$scope', '$http', function($scope, $http) {
  $http.get('/api/images?action=newest').success(function(data) {
  	$scope.newest = data;
  });

  $http.get('/api/images?action=random').success(function(data) {
    $scope.random = data;
  });

  $http.get('/api/images?action=updated').success(function(data) {
    $scope.updated = data;
  });

  $http.get('/api/tags').success(function(tags) {
  	_.forEach(tags, function(tag) {
  	  tag.weight = tag.count;
      tag.link = '#/tags/' + tag.id;
  	});

  	$scope.tags = tags;
  });
}]);