app.factory('PersonsService', function($modal, $http) {
  return {
    select : function(callback, cancel) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/persons/select.html',
        controller: function ($scope, $modalInstance, $http, $location) {
          $http.get('/api/persons').success(function(data) {
            $scope.persons = data;
          });

          $scope.select = function(person) {
            $modalInstance.close();

            if (callback) {
              callback(person);
            }
          };

           $scope.cancel = function () {
            $modalInstance.dismiss('cancel');

            if (cancel) {
              cancel();
            }
          };
        }
      });
    }
  }
});