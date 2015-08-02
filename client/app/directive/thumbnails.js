app.directive('thumbnails', function() {
  return {
    controller : function($scope, $element, $attrs, $window, $location, $routeParams, DownloadService, GalleryService) {
      var calc = function(images) {
        var sl = [];

        var scaleSum = 0;

        var width = $element.parent().width();

        var addAA = function(images, height) {
          if (images.length > 0) {
            _.forEach(images,function(image) {
              image.thumb_width = height * image.scale;
              image.thumb_height = height;
            });
          }
        };

        var number = (width > 800) ? 4 : (width > 400) ? 3 : 2;

        var maxHeight = width / number;

        _.forEach(images, function(image) {
          if (!image.width) {
            image.hide = true;
            $scope.hidden = true;
            return;
          }
          image.scale = image.orientation === 8 || image.orientation === 6 ? image.height / image.width : image.width / image.height;

          scaleSum+=image.scale;
          sl.push(image);

          var k = (width - sl.length * 4 - 4) / scaleSum;
          if (k < maxHeight) {
            addAA(sl, k);
            scaleSum = 0; 
            sl = [];
          }
        });

        addAA(sl, maxHeight); 
      };

      $scope.reload = function() {
        var url = $location.url();
        if (url.indexOf('?') > 0) {
          url += '&';
        } else {
          url += '?';
        }

        url += 'y=' + window.scrollY;

        console.log(url);

        $location.url(url);
      };

      $scope.allSelected = false;
      $scope.selectAll = function() {
        _.forEach($scope.images, function(image) {
          image.selected = !$scope.allSelected;
        });
        $scope.allSelected = !$scope.allSelected;
      };

      var getSelected = function() {
        var selected = [];

        $scope.images.forEach(function(file) {
          if (file.selected) {
            selected.push(file);
          }
        });

        return selected;
      };

      $scope.top = function() {
        window.scrollTo(0,0);
      };

      $scope.download = function(width) {
        DownloadService.images(getSelected(), width);
      };

      $scope.addTags = function() {
        GalleryService.addTags(getSelected());
      };

        $scope.addToGallery = function() {
    GalleryService.addImages(getSelected());
  };

  $scope.create = function () {
    GalleryService.create(getSelected());
  };

  $scope.setView = function(type) {
    $scope.view = type;
  };


      $scope.$watchCollection('images', function(images) {
        if (!images) {
          return;
        }

        calc(images);
      });

      $scope.$watch('images', function(images) {
        setTimeout(function() {
          if ($routeParams.y) {
              console.log('ScrollTo:' + $routeParams.y);
              window.scrollTo(0, $routeParams.y);
            }
          }, 10);
      });
    },
    restrict: 'E',
    scope: {
      images: '=images',
      toolbar: '=toolbar',
      showDeleted: '=showDeleted'
    },
    templateUrl: 'templates/directives/thumbnails.html'
  };
});