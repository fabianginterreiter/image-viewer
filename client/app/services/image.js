app.factory('ImageService', function($modal, $http, Dialogs) {
  return {
    edit: function(image, callback) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/images/edit.html',
        controller: function($scope, $modalInstance, $http, $location) {
          $scope.name = image.name;
          $scope.title = image.title;

          $scope.ok = function() {
            image.title = $scope.title;

            $http.put('/api/images/' + image.id, image).success(function(result) {
              $modalInstance.close();
              Dialogs.alert('Update', 'The image ' + image.name + ' was updated successfully.');
            });
          };

          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          };
        }
      }).result.then(function() {
        if (callback) {
          callback();
        }
      });
    }
  }
});
