app.controller('GalleryCtrl', ['$scope', '$http', '$routeParams', '$window', 'DownloadService', 'GalleryService', 'Dialogs', '$location', 'usSpinnerService', function($scope, $http, $routeParams, $window, DownloadService, GalleryService, Dialogs, $location, usSpinnerService) {

  var directory = $routeParams.directory;
  var tag = $routeParams.tag;
  var person = $routeParams.person;
  var id = $routeParams.id;
  var gps = $routeParams.gps;

  if (directory) {
    $http.get('/api/galleries/' + id + '/directories/' + directory).success(function(data) {
      $scope.directory = data;
    }); 
  }

  if (tag) {
    $http.get('/api/galleries/' + id + '/tags/' + tag).success(function(data) {
      $scope.tag = data;
    }); 
  }

  if (person) {
    $http.get('/api/galleries/' + id + '/persons/' + person).success(function(data) {
      $scope.person = data;
    });
  }

  if (gps) {
    $scope.gps = true;
    $scope.gpsValue = gps === 'true';
  }

  $http.get('/api/galleries/' + id).success(function(data) {
    if (directory) {
      $http.get('/api/galleries/' + id + '/directories/' + directory + '/images').success(function(images) {
        data.images = images;
        $scope.gallery = data;
        usSpinnerService.stop('browse');  
      });
    } else if (tag) {
      $http.get('/api/galleries/' + id + '/tags/' + tag + '/images').success(function(images) {
        data.images = images;
        $scope.gallery = data;
        usSpinnerService.stop('browse');  
      });
    } else if (person) {
      $http.get('/api/galleries/' + id + '/persons/' + person + '/images').success(function(images) {
        data.images = images;
        $scope.gallery = data;
        usSpinnerService.stop('browse');  
      });
    } else if (gps) {
      $http.get('/api/galleries/' + id + '/images?gps=' + gps).success(function(images) {
        data.images = images;
        $scope.gallery = data;
        usSpinnerService.stop('browse');  
      });
    } else {
      $scope.gallery = data;  
      usSpinnerService.stop('browse');
    }
  });



    setTimeout(function() {
    if (!$scope.images) {
      usSpinnerService.spin('browse');
    }
  }, 10);

  var getSelected = function() {
    var selected = [];

    $scope.gallery.images.forEach(function(file) {
      if (file.selected) {
        selected.push(file);
      }
    });

    return selected;
  };

  $scope.edit = function() {
    GalleryService.edit($scope.gallery);
  };

  

  $scope.delete = function() {
    Dialogs.confirm('Delete', 'Do you want to delete the selected image from this gallery?', function() {
      var selected = getSelected();
      $http.post('/api/galleries/' + $scope.gallery.id + '/images/delete', selected).success(function(data) {
        _.remove($scope.gallery.images, function(n) {
          return n.selected;
        });
      });
    });
  };

  $scope.deleteGallery = function() {
    Dialogs.delete('Delete', 'Do you really want to delete: ' + $scope.gallery.name, function() {
      $http.delete('/api/galleries/' + $scope.gallery.id).success(function() {
        $location.path('/galleries');
      });
    });
  };

  $scope.downloadGallery = function(width) {
    DownloadService.gallery($scope.gallery, width);
  };

  $scope.changeGalleryImage = function() {
    var selected = getSelected();
    if (selected.length > 0) {
      $scope.gallery.image_id = selected[0].id;
      $http.put('/api/galleries/' + $scope.gallery.id, $scope.gallery).success(function(result) {
        Dialogs.alert('Update Gallery Image', 'Gallery Images is updated!');
      });
    } else {
      Dialogs.alert('UPdate Gallery Image', 'No Image is selected!');
    }
  };
}]);