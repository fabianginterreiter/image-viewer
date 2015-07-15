app.factory('TagService', function($modal, $http, Dialogs) {
  return {
    edit : function(tag, callback) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/tags/edit.html',
        controller: function ($scope, $modalInstance, $http) {

          $scope.text = tag.text;

          $scope.save = function () {
            tag.text = $scope.text;

            $http.put('/api/tags/' + tag.id, tag).success(function(result) {
              $modalInstance.close();
            });
          };

          $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        }
      });
    }
  }
});

app.controller('TagCtrl', ['$scope', '$http', '$routeParams', 'TagService', 'Dialogs', '$location', function($scope, $http, $routeParams, TagService, Dialogs, $location) {
  $http.get('/api/tags/' + $routeParams.id).success(function(data) {
    $scope.tag = data;
  });

  $scope.edit = function() {
  	TagService.edit($scope.tag);
  };

  $scope.delete = function() {
    Dialogs.delete('Delete', 'Do you really want to delete: ' + $scope.tag.text, function() {
      $http.delete('/api/tags/' + $scope.tag.id).success(function() {
        $location.path('/tags');
      });
    });
  };
}]);