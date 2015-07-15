app.controller('PersonsCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', '$filter', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService, $filter) {

  $scope.updateFilteredList = function() {
    $scope.filteredList = $filter("filter")($scope.persons, $scope.query);
  };

	$scope.filteredList = [];

	$http.get('/api/persons/').success(function(data) {
    _.forEach(data, function(person) {
      person.count = parseInt(person.count);
    });
  	 $scope.persons = data;
     $scope.updateFilteredList();
  });

  $http.get('/api/images?action=marked').success(function(data) {
    _.forEach(data, function(person) {
      person.count = parseInt(person.count);
    });
  	$scope.images = data;
  });

  

  $scope.config = {
    itemsPerPage: 30,
    fillLastPage: false
  }
}]);