app.factory('PersonService', function($modal, $http, Dialogs) {

return {
  edit : function(person, callback) {
  $modal.open({
    animation: true,
    templateUrl: 'templates/persons/edit.html',
    controller: function ($scope, $modalInstance, $http) {

      $scope.name = person.name;

      $scope.save = function () {
        person.name = $scope.name;

        $http.put('/api/persons/' + person.id, person).success(function(result) {
        });

        $modalInstance.close();
      };

      $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
      };
    }
  });
}}});


app.controller('PersonCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', 'PersonService', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService, PersonService) {
  $http.get('/api/persons/' + $routeParams.id).success(function(data) {
  	$scope.person = data;
  });

  $scope.edit = function() {
  	PersonService.edit($scope.person);
  };

  $scope.delete = function() {
    Dialogs.delete('Test', 'Deletsososo', function() {
      $http.delete('/api/persons/' + $scope.person.id).success(function() {
        $location.path('/persons');
      });
    });
  }
}]);