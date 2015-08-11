

app.controller('BrowseCtrl', ['$scope', '$http', '$routeParams', '$location', '$modal', '$log', '$window', 'DownloadService', 'Dialogs', 'GalleryService', 'usSpinnerService', 'FilterService', '$timeout', 'UploadService', 'ImageViewerService', function($scope, $http, $routeParams, $location, $modal, $log, $window, DownloadService, Dialogs, GalleryService, usSpinnerService, FilterService, $timeout, UploadService, ImageViewerService) {
  ImageViewerService.open();

  $scope.download = function(width) {
    DownloadService.images(getSelected(), width);
  };

  $scope.loaded = false;

  var elements = [];

  $scope.elements = elements;
  if ($scope.elements.length > 0) {
    $scope.last = $scope.elements[$scope.elements.length - 1];
  } else {
    $scope.last = {
      name : 'Home'
    };
  }

  $timeout(function() {
    if (!$scope.images) {
      usSpinnerService.spin('browse');
    }
  }, 10);
  
  if (!$routeParams.id) {
    $routeParams.id = 0;
  }

	FilterService.filter($http, $routeParams, 'directories', function(err, data) {
    $scope.id = $routeParams.id;
    $scope.name = data.name;
    $scope.images = data.images;
    $scope.directories = data.directories;
    $scope.navigation = data.navigation;
    $scope.directory = data;
    
    usSpinnerService.stop('browse');

    $scope.loaded = true;

    if ($routeParams.image) {
      var index = _.findIndex(data.images, function(image) {
        return image.id === $routeParams.image;
      });

      data.images[index].selected = true;
      
      $timeout(function() {
        var element = document.getElementById('image-' + $routeParams.image);
        if (element) {
          element.scrollIntoView( true );
        }
      }, 200);
    }
	});

  $scope.isImage = function(file) {
    return (file && file.filename && file.filename.endsWith('JPG'));
  };

  $scope.delete = function() {
    var selected = getSelected();
    Dialogs.confirm('Delete', 'Delete selected images?', function() {
      var ids = [];
      selected.forEach(function(image) {
        ids.push(image.id);
      });

      $http.delete('/api/images/' + ids.join('+')).success(function() {
        _.forEach(selected, function(image) {
          var index = $scope.images.indexOf(image);
          if (index >= 0) {
            $scope.images.splice(index, 1);
          }
        });
      });
    });
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

    _.forEach($scope.images, function(file) {
      if (file.selected) {
        selected.push(file);
      }
    });

    return selected;
  };

  $scope.showUsed = function() {
    $http.get('/api/directories/' + $scope.id + '/used').success(function(ids) {
      _.forEach($scope.images, function(image) {
        image.marked = _.contains(ids, image.id);
      });
    });
  };

  $scope.showUnused = function() {
    $http.get('/api/directories/' + $scope.id + '/unused').success(function(ids) {
      _.forEach($scope.images, function(image) {
        image.marked = _.contains(ids, image.id);
      });
    });
  };

  $scope.unmarkAll = function() {
    _.forEach($scope.images, function(image) {
      image.marked = false;
    });
  };

  $scope.upload = function() {
    UploadService.upload($scope.directory, function(images) {

    });
  };

  $scope.createFolder = function() {

  };
}]);