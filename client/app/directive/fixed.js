app.directive('fixed', function() {
  return {
    link: function(scope, element, attributes, $window) {
      var child = element.children()[0];
      var offsetHeight = child.offsetHeight;
      scope.distance = element.offset().top - scope.top;
      element.css('height', offsetHeight + 'px');
      scope.child = angular.element(child);
      scope.origin_position = scope.child.css('position');
      scope.origin_left = scope.child.css('left');
      scope.origin_right = scope.child.css('right');
      scope.origin_top = scope.child.css('top');

      scope.$watch(function() {
        return element.offset().top;
      }, function(value)  {
        scope.distance = value - scope.top;
      }, true);
    },

    controller: function($scope, $window) {
      angular.element($window).bind('scroll', function(e) {
        if (angular.element($window).scrollTop() > $scope.distance) {
          if ($scope.child && $scope.child.css('position') !== 'fixed') {
            $scope.child.css('position', 'fixed');
            $scope.child.css('top', $scope.top ? $scope.top : '0');
            $scope.child.css('left', $scope.left ? $scope.left : '0');
            $scope.child.css('right', $scope.right ? $scope.right : '0');
          }
        } else {
          if ($scope.child && $scope.child.css('position') === 'fixed') {
            $scope.child.css('position', $scope.origin_position);
            $scope.child.css('top', $scope.origin_top);
            $scope.child.css('left', $scope.origin_left);
            $scope.child.css('right', $scope.origin_right);
          }
        }
      });
    },

    scope: {
      top: '=top',
      left: '=left',
      right: '=right'
    }
  };
});
