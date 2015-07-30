app.directive('galleries', function() {
  return {
    restrict: 'E',
    scope: {
      galleries: '=galleries'
    },
    templateUrl: 'templates/directives/galleries.html'
  };
});

app.factory('GalleryService', function($modal, $http, Dialogs) {

  var setGalleries = function(scope, gallery) {
    var defaultParent = {
        id : 0,
        name : ''
      };

    scope.parent = defaultParent;

    var s = function(data, pretext) {
      data.forEach(function(g) {
        if (gallery && gallery.id === g.id) {
          return;
        }
        g.name = pretext + ' ' + g.name;
        if (gallery && gallery.parent_id === g.id) {
          scope.parent = g;
        }
        scope.galleries.push(g);
        s(g.galleries, pretext + '-');
      });
    };

    $http.get('/api/galleries').success(function(data) {
      scope.galleries = [];
      scope.galleries.push(defaultParent);
      s(data, '');
    });
  };

  var getList = function(data) {
    if (Array.isArray(data)) {
      return data;
          } else {
            return [ data ];  
      }
  }

  return {
    create : function(data, callback) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/galleries/create.html',
        controller: function ($scope, $modalInstance, $http, $location) {
          $scope.items = getList(data);

          setGalleries($scope);

          $scope.name = '';
          $scope.description = '';

          $scope.ok = function () {
            var gallery = {
              name : $scope.name,
              description : $scope.description,
              images : $scope.items,
              parent_id : $scope.parent.id
            };

            $http.post('/api/galleries', gallery).success(function(result) {
              $location.path('/galleries/' + result.id);
            });

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
    },

    edit : function(gallery, callback) {
      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/galleries/edit.html',
        controller: function ($scope, $modalInstance, $http, $location) {
          $scope.name = gallery.name;
          $scope.description = gallery.description;
          
          setGalleries($scope, gallery);

          $scope.ok = function () {
            var data = {};
            data.id = gallery.id;
            data.name = $scope.name;
            data.description = $scope.description;
            data.parent_id = $scope.parent.id;
            data.image_id = gallery.image_id;

            gallery.name = $scope.name;
            gallery.description = $scope.description;
            gallery.parent_id = data.parent_id;

            $http.put('/api/galleries/' + data.id, data).success(function(result) {
              $modalInstance.close();  
              Dialogs.alert('Update', 'The Gallery ' + gallery.name + ' was updated successfully.');
            });
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
    },

    addTags : function(data, callback) {
      var images = getList(data);
      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/galleries/add_tags.html',
        controller: function ($scope, $modalInstance, $http, $location) {
          $scope.tags = [];

          $scope.add = function(gallery) {
            var loaded = _.after($scope.tags.length, function() {
              _.forEach(images, function(image) {
                _.forEach($scope.tags, function(tag) {
                  $http.post('/api/images/' + image.id + '/tags', tag);
                });
              });
            });

            _.forEach($scope.tags, function(tag) {
              if (tag.id) {
                loaded();
              } else {
                $http.post('/api/tags', tag).success(function(data) {
                  tag.id = data.id;
                  loaded();
                });
              }
            });

            $modalInstance.close();
          };

           $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };

          $scope.loadTags = function(query) {
            return $http.get('/api/tags?query=' + query);
          };
        }
      });
    },

    addImages : function(data, callback) {
      var images = getList(data);

      var s = function(scope, galleries, path) {
        if (!scope.galleries) {
          scope.galleries = [];
        }
        galleries.forEach(function(gallery) {
          gallery.path = path;

          var p = gallery.name;
          if (path && path.length > 0) {
            p = path + ' > ' + p;
          }

          s(scope, gallery.galleries, p);

          scope.galleries.push(gallery);
        });
      };

      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/galleries/add.html',
        controller: function ($scope, $modalInstance, $http, $location) {
          $http.get('/api/galleries').success(function(data) {
            s($scope, data);
          });

          $scope.add = function(gallery) {
            $http.post('/api/galleries/' + gallery.id + '/images', images).success(function(e) {
              if (callback) {
                callback();
              }
            });

            $modalInstance.close();
          };

           $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        }
      });
    },

    setAsGalleryImage : function(image, callback) {
      var s = function(scope, galleries, path) {
        if (!scope.galleries) {
          scope.galleries = [];
        }
        galleries.forEach(function(gallery) {
          gallery.path = path;

          var p = gallery.name;
          if (path && path.length > 0) {
            p = path + ' > ' + p;
          }

          s(scope, gallery.galleries, p);

          scope.galleries.push(gallery);
        });
      };

      $modal.open({
        animation: true,
        templateUrl: 'templates/directives/galleries/setAsGalleryImage.html',
        controller: function ($scope, $modalInstance, $http, $location) {
          $http.get('/api/galleries').success(function(data) {
            s($scope, data);
          });

          $scope.add = function(gallery) {
            gallery.image_id = image.id;
            $http.put('/api/galleries/' + gallery.id, gallery).success(function(result) {
              if (callback) {
                callback();
              }
            });

            $modalInstance.close();
          };

           $scope.cancel = function () {
            $modalInstance.dismiss('cancel');
          };
        }
      });
    }
  };
});