app.factory('PersonService', function($modal, $http, Dialogs) {
  return {
    edit: function(person, callback) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/persons/edit.html',
        controller: function($scope, $modalInstance, $http) {

          $scope.name = person.name;

          $scope.save = function() {
            person.name = $scope.name;

            $http.put('/api/persons/' + person.id, person).success(function(result) {});

            $modalInstance.close();
          };

          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          };
        }
      });
    }
  }
});


app.controller('PersonCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'Dialogs', '$location', 'usSpinnerService', 'PersonService', 'FilterService', 'ImageViewerService', function($scope, $http, $routeParams, $window, DownloadService, Dialogs, $location, usSpinnerService, PersonService, FilterService, ImageViewerService) {
  ImageViewerService.open();

  FilterService.filter($http, $routeParams, 'persons', function(err, person) {
    $scope.person = person;
  });

  $scope.setImage = function() {
    var selection = _.filter($scope.person.images, function(image) {
      return image.selected;
    });
    if (selection.length > 0) {
      $location.path('/persons/' + $routeParams.id + '/image/' + selection[0].id);
    }
  };

  $scope.edit = function() {
    console.log("wuf");
    PersonService.edit($scope.person);
  };

  $scope.delete = function() {
    Dialogs.delete('Test', 'Deletsososo', function() {
      $http.delete('/api/persons/' + $scope.person.id).success(function() {
        $location.path('/persons');
      });
    });
  };
}]);
