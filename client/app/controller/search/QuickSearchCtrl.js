app.controller('QuickSearchCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
	$scope.search = function() {
		$location.path('/search/result').search({
			query : $scope.query
		});
	};
}]);