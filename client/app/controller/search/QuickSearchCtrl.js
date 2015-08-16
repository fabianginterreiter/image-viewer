app.controller('QuickSearchCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
	$scope.search = function() {
		var q = $scope.query;
		$scope.query = '';
		$location.path('/search/result').search({
			query : q
		});
	};
}]);