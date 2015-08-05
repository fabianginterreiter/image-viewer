app.factory('UploadService', function($modal, $http, Dialogs) {
  return {
    upload : function(directory, callback) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/upload.html',
        controller: function ($scope, $modalInstance, $http, $location, FileUploader) {
          $scope.directory = directory;

          $scope.uploader = new FileUploader();

          $scope.uploader.url = '/api/directories/' + directory.id + '/images';

          $scope.ok = function () {
            $modalInstance.close();
          };

          $scope.cancel = function () {
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