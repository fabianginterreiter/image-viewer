app.factory('Dialogs', function($modal) {
  return {
    alert : function(title, message, callback) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/dialogs/alert.html',
        controller: function($scope, $modalInstance) {
          $scope.close = function () {
            $modalInstance.close();
          };
          $scope.title = title;
          $scope.message = message;
        }
      }).result.then(function() {
        if (callback) {
          callback();
        }
      });
    },
    confirm : function(title, message, ok, cancel) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/dialogs/confirm.html',
        controller: function($scope, $modalInstance) {
          $scope.ok = function () {
            $modalInstance.close(true);
          };
          $scope.cancel = function() {
            $modalInstance.close(false);
          };
          $scope.title = title;
          $scope.message = message;
        }
      }).result.then(function(status) {
        if (status) {
          if (ok) {
            ok(status);
          }
        } else {
          if (cancel) {
            cancel(status);
          }
        }
      });
    },
    delete : function(title, message, ok, cancel) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/dialogs/delete.html',
        controller: function($scope, $modalInstance, $timeout) {
          $scope.ok = function () {
            if (!$scope.waiting) {
              $modalInstance.close(true);
            }
          };
          $scope.cancel = function() {
            $modalInstance.close(false);
          };
          $scope.title = title;
          $scope.message = message;

          $scope.waiting = true;
          $scope.seconds = 6;

          var countDown = function() {
            $scope.seconds--;
            if ($scope.seconds > 0) {
              $timeout(function() {
                countDown();
              }, 1000);  
            } else {
              $scope.waiting = false;
            }
          };

          countDown();
        }
      }).result.then(function(status) {
        if (status) {
          if (ok) {
            ok(status);
          }
        } else {
          if (cancel) {
            cancel(status);
          }
        }
      });
    }
  };
});