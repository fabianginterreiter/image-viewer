app.factory('ImageCache', function($log) {
  var cache = [];
  var images = [];

  var preload = function(id, width, height) {
    if (images && images.length > 0)  {
      var p = find(id);
      if (p > 0) {
        result.get(images[p - 1].id, width, height, true);
      }
      if (p < images.length - 1) {
        result.get(images[p + 1].id, width, height, true);
      }
    }
  };

  var find = function(id) {
    for (var index = 0; index < images.length; index++) {
      if (id === images[index].id) {
        return index;
      }
    }
    return -1;
  };

  var url = function(id, width, height) {
    if (width && height) {
      return '/api/images/' + id + '/resize?width=' + width + '&height=' + height;
    } else if (width) {
      return '/api/images/' + id + '/resize?width=' + width + '&height=' + (width / 1.5);
    } else {
      return '/api/images/' + id + '/resize';
    }
  };

  var result = {
    addImages: function(i) {
      images = i;
    },

    get: function(id, width, height, noPreload) {
      var src = url(id, width, height);
      if (!noPreload) {
        preload(id, width, height);
      }

      var element = cache[src];
      if (!element) {
        $log.debug("Loading: " + src);
        element = new Image();
        element.src = src;
        cache[src] = element;
      }

      element.time = new Date().getTime();

      return element;
    }
  };

  return result;
});

app.directive('imageonload', function() {
  return {
    restrict: 'A',
    controller: function($scope, $element, usSpinnerService) {
      $element.bind('load', function($event) {
        usSpinnerService.stop('spinner-1');
        $scope.$parent.image_width = event.target.naturalWidth;
        $scope.$parent.image_height = $event.target.naturalHeight;
      });
    }
  };
});

var preloaded = [];

app.directive('show', function() {
  return {
    controller: function($scope, $element, $attrs, $http, usSpinnerService, ImageCache, $timeout, $modalStack, $location, MapsService, GalleryService, Dialogs, ImageService, PersonsService) {
      var image = null;
      var fullscreen = false;

      $scope.edit = function() {
        ImageService.edit(image);
      };

      $scope.loaded = function($event) {
        usSpinnerService.stop('spinner-1');

        $scope.image_width = $event.target.naturalWidth;
        $scope.image_height = $event.target.naturalHeight;

        $scope.offsetLeft = $event.target.offsetLeft;
      };

      var update = function() {
        if (!image || !image.id) {
          return;
        }

        var id = image.id;

        var parent = angular.element('#image');
        var width = parent.width();
        var height = parent.height();

        if (!width && !height) {
          return;
        }

        if (fullscreen) {
          $scope.src = ImageCache.get(id, screen.width, screen.height).src;
        } else {
          $scope.src = ImageCache.get(id, width).src;
        }
      };

      $scope.$watch('image', function(data) {
        $scope.view = 'image';
        image = data;
        console.log("Loaded: " + image.id);
        $scope.image = data;

        if (!image) {
          return;
        }

        update();
        usSpinnerService.spin('spinner-1');
      });

      $scope.$watch('preload', function(preload) {
        ImageCache.addImages(preload);
      });

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

      $scope.setFullscreen = function() {
        if (screenfull.enabled) {
          screenfull.request(document.getElementById("image"));
        }
      };

      document.addEventListener('webkitfullscreenchange', function(e) {
        fullscreen = !fullscreen;
      }, false);

      $scope.setCoordinates = function() {
        MapsService.setCoordinates($scope.image);
      };

      addEventToDocument($scope, 'keydown', function(event) {
        if (event.keyCode === 46) {
          $scope.delete();
        } else if ($scope.selectable && event.keyCode === 77)  {
          $scope.image.selected = !$scope.image.selected;
          angular.element("#checkIcon").css('opacity', '1');
          setTimeout(function() {
            angular.element("#checkIcon").css('opacity', '0');
          }, 300);
          $scope.$apply();
        }
      });

      $scope.$watch(function() {
        return angular.element('#image').width();
      }, function(newValue, oldValue) {
        if (newValue !== oldValue) {
          update();
        }
      }, true);

      window.onresize = function()  {
        update();
        $scope.$apply();
      };

      $scope.create = function() {
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

      $scope.view = 'image';

      $scope.setView = function(type) {
        if (type === 'details') {
          if (!image.directory) {
            $http.get('/api/images/' + image.id).success(function(data) {
              for (var k in data) {
                image[k] = data[k];
              }

              $scope.view = type;
            });
          } else {
            console.log("set" + type);

            $scope.view = type;
          }
        } else if (type === 'exif') {
          if (!image.exif) {
            $http.get('/api/images/' + image.id + '/exif').success(function(exif) {
              image.exif = JSON.stringify(exif);
              $scope.view = type;
            });
          } else {
            $scope.view = type;
          }
        } else {
          $scope.view = type;
        }
      }
    },
    restrict: 'E',
    scope: {
      image: '=image',
      preload: '=preload',
      toolbar: '=toolbar',
      selectable: '=selectable',
      link: '=link'
    },
    templateUrl: 'templates/directives/show.html'
  };
});
