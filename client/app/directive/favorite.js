app.directive('favorite', function() {
  return {
    controller: function($scope, $http) {
      $scope.add = function() {
        $http.put('/api/favorites/' + $scope.image.id).success(function() {
          $scope.image.favorite = true;
        });
      };

      $scope.remove = function() {
        $http.delete('/api/favorites/' + $scope.image.id).success(function() {
          $scope.image.favorite = false;
        });
      };
    },
    restrict: 'E',
    scope: {
      image: '=image'
    },
    templateUrl: 'templates/directives/favorite.html',
    link: function(scope, element, attrs) {
      element.bind('click', function() {
        if (scope.image.favorite) {
          scope.remove();
        } else {
          scope.add();
        }
      });
    }
  };
});
