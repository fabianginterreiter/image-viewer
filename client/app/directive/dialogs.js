app.factory('Dialogs', function($modal) {
  var open = false;

  return {
    alert: function(title, message, callback) {
      if (open) {
        if (callback) {
          callback(false);
        }
        return;
      }

      open = true;

      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/dialogs/alert.html',
        controller: function($scope, $modalInstance, $timeout) {
          $scope.close = function() {
            $modalInstance.close();
          };
          $scope.title = title;
          $scope.message = message;

          $timeout(function() {
            angular.element('#alertCloseButton').focus();
          }, 100);
        }
      }).result.then(function() {
        open = false;
        if (callback) {
          callback(true);
        }
      });
    },
    confirm: function(title, message, ok, cancel) {
      if (open) {
        if (cancel) {
          cancel(false);
        }
        return;
      }

      open = true;

      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/dialogs/confirm.html',
        controller: function($scope, $modalInstance, $timeout) {
          $scope.ok = function() {
            $modalInstance.close(true);
          };
          $scope.cancel = function() {
            $modalInstance.close(false);
          };
          $scope.title = title;
          $scope.message = message;

          $timeout(function() {
            angular.element('#confirmCancelButton').focus();
          }, 100);
        }
      }).result.then(function(status) {
        open = false;
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
    delete: function(title, message, ok, cancel, time) {
      if (open) {
        if (cancel) {
          cancel(false);
        }
        return;
      }

      open = true;

      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/dialogs/delete.html',
        controller: function($scope, $modalInstance, $timeout) {
          $scope.ok = function() {
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

          if (time === false) {
            $scope.seconds = 0;
          }

          if (time) {
            $scope.seconds = time;
          }

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

          $timeout(function() {
            angular.element('#deleteCancelButton').focus();
          }, 100);

          countDown();
        }
      }).result.then(function(status) {
        open = false;
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
