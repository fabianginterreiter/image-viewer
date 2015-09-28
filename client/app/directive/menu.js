app.directive('menu', function() {
  return {
    link: function(scope, element, attrs) {
    }, 

    controller : function($scope, $http, $timeout, DownloadService, GalleryService, Dialogs, ImageService) {
      var open = false;
      var menu = angular.element('#menu');

      $scope.open = function() {
        if (open) {
          menu.removeClass('opened');
          //menu.css('height', '60px');
        } else {
          //menu.css('height', '120px');
          menu.addClass('opened');
        }

        $timeout(function() {
          open = !open;
        }, 20);
      };

      var isOutSide = function(element) {
        while (element.tagName !== 'BODY') {
          if (element.id === 'menu') {
            return false;
          }
          element = element.parentNode;
        }
        return true;
      }

      addEventToDocument($scope, 'click', function(event) {
        if (open && isOutSide(event.target)) {
          $scope.open();
        }
      });

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

  $scope.setCoordinates = function() {
        MapsService.setCoordinates($scope.image);
      };

      $scope.edit = function() {
        ImageService.edit($scope.image);
      };

$scope.delete = function() {
        Dialogs.delete('Delete', 'Do you want to delete the current image?', function() {
          $http.delete('/api/images/' + $scope.image.id).success(function() {
            $scope.image.deleted = true;
          });
        }, null, false);
      }

      $scope.restore = function() {
        $http.put('/api/trash/restore/' + $scope.image.id).success(function() {
          $scope.image.deleted = false;
        });
      };


       $scope.createGallery = function() {
          GalleryService.create($scope.image);
        };

        $scope.addToGallery = function() {
    GalleryService.addImages($scope.image);
  };
    $scope.setAsGalleryImage = function() {
      GalleryService.setAsGalleryImage($scope.image);
    };

    $scope.setAsPersonImage = function(image) {
      PersonsService.select(function(person) {
        $location.path('/persons/' + person.id + '/image/' + $scope.image.id);
      });
    };
    },
    restrict: 'E',
    scope: {
      title: '=title',
      images: '=images',
      person: '=person',
      image: '=image'
    },

    transclude: true,

    templateUrl: 'templates/directives/menu.html'
    
  };
});