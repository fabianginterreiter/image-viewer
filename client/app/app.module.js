String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

var app = angular.module('imageApp', ['ngRoute', 'ui.bootstrap', 'angularSpinner', 'ngTagsInput', 'autocomplete', 'ngLoad', 'angular-table', 'angular-jqcloud', 'angularFileUpload', 'ngJcrop']);


app.config(function(ngJcropConfigProvider){

    // [optional] To change the jcrop configuration
    // All jcrop settings are in: http://deepliquid.com/content/Jcrop_Manual.html#Setting_Options
    ngJcropConfigProvider.setJcropConfig({
        bgColor: 'black',
        bgOpacity: .4,
        aspectRatio: 1
    });

    // [optional] To change the css style in the preview image
    ngJcropConfigProvider.setPreviewStyle({
        'width': '100px',
        'height': '100px',
        'overflow': 'hidden',
        'margin-left': '5px'
    });

});

app.factory('SessionService', function($http, $modal) {
  var currentUser = null;

  var listeners = [];

  var tell = function(user) {
    _.forEach(listeners, function(listener) {
      listener(user);
    });
  };

  var showDialog = function() {
    $http.get('/api/users').success(function(users) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/users/index.html',
        backdrop: 'static',
        keyboard: false,
        controller: function ($scope, $modalInstance, $http, $location) {
          $scope.users = users;

          $scope.select = function (user) {
            $http.post('/api/session', user).success(function(res) {
              currentUser = user;
              tell(user);
              $modalInstance.close();
            });
          };

          $scope.create = function(name) {
            $http.post('/api/users', { name : name }).success(function(user) {
              $scope.users.push(user);
              $scope.view = 'select';
            });
          }
        }
      }).result.then(function() {

      });
    });  
  };

  return {
    watch : function(callback) {
      listeners.push(callback);
    },

    getCurrentUser : function() {
      return currentUser;
    },

    delete : function() {
      tell(null);
      currentUser = null;

      $http.delete('/api/session').success(function() {
        showDialog();
      });
    },

    init : function() {
      $http.get('/api/session').success(function(user) {
        if (user.id) {
          currentUser = user;
          tell(user);
        } else {
          showDialog();
        }
      })
    }
  };
});

app.run(function(SessionService) {
  SessionService.init();
});