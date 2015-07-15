app.controller('ConfigCtrl', ['$scope', '$http', 'Dialogs', function($scope, $http, Dialogs) {
  $http.get('/api/cache').success(function(data) {
  	$scope.cache = data;
  });

  $scope.clear = function() {
  	Dialogs.confirm('Clear Cache', 'Do you want to clear the cache?', function(status) {
  		if (status) {
  			$http.get('/api/cache/clear').success(function() {
  				$http.get('/api/cache').success(function(data) {
				  	$scope.cache = data;
				  });
  			});
  		}
  	});
  };
}]);