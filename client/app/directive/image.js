app.controller('ImageViewerCtrl', ['$scope', '$modalInstance', '$http', 'image', 'images', 'selectable', 'Dialogs', function ($scope, $modalInstance, $http, image, images, selectable, Dialogs) {
  $scope.images = images;
  $scope.image = image;
  $scope.selectable = selectable != 'false';
  console.log("Image: " + $scope.selectable);
  $scope.length = images.length;

  $scope.position = 0;
  for (var index = 0; index < $scope.images.length; index++) {
    if ($scope.image.id === $scope.images[index].id) {
      $scope.position = index;
    }
  }

  angular.element("body").keydown(function(event){
      if (event.keyCode === 39) {
        $scope.next();
        $scope.$apply();
      }
      else if (event.keyCode === 37) {
        $scope.previous();
        $scope.$apply();
      }
  });

  $scope.mm = function() {
    var e = angular.element("#image");
    if (e.hasClass('visible')) {
      return;
    }

    e.addClass("visible");

    setTimeout(function() {
      e.removeClass('visible');
    }, 2000);
  };

  

  $scope.next = function() {
    if ($scope.hasNext()) {
      $scope.position++;
      $scope.image = images[$scope.position];
    }
  };

  $scope.hasNext = function() {
    return $scope.position + 1 < $scope.length;
  };

  $scope.hasPrevious = function() {
    return $scope.position > 0;
  };

  $scope.previous = function() {
    if ($scope.hasPrevious()) {
      $scope.position--;
      $scope.image = images[$scope.position];
    }
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
}]);

app.directive('viewImage', function() {
  return {
        link: function(scope, element, attributes, $modal) {
            scope.$watch(attributes.viewImage, function(image) {
              scope.image = image;
            });

            element.click(function() {
              scope.click();
            });

            console.log("#" + attributes.selectable);
            scope.selectable = attributes.selectable;

        },
        controller : ['$scope' , '$modal' , function($scope, $modal) {
          $scope.click = function() {
            var modalInstance = $modal.open({
                animation: true,
                templateUrl: 'templates/directives/image.html',
                controller: 'ImageViewerCtrl',
                size: 'lg',
                resolve: {
                  selectable: function() {
                    return $scope.selectable;
                  },
                  image: function () {
                    return $scope.image;
                  },
                  images: function() {
                    return $scope.images;
                  }
                }
              });
          };
        }]
    };
});