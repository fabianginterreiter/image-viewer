app.controller('SearchResultCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
  var person_ids = $routeParams.persons ? $routeParams.persons : '';
  var tagIds = $routeParams.tags ? $routeParams.tags : '';
  var galleryIds = $routeParams.galleries ? $routeParams.galleries : '';
  var minDate = $routeParams.minDate;
  var maxDate = $routeParams.maxDate;

  $scope.personsOnly = $routeParams.personsOnly === 'true';
  $scope.tagsOnly = $routeParams.tagsOnly === 'true';
  $scope.galleriesOnly = $routeParams.galleriesOnly === 'true';

  $scope.persons = [];
  $scope.tags = [];
  $scope.galleries = [];

  if (person_ids.length > 0) {
    _.forEach(person_ids.split(','), function(personId) {
      $http.get('/api/persons/' + personId).success(function(data) {
        $scope.persons.push(data);
      });
    });
  }

  if (tagIds.length > 0) {
    _.forEach(tagIds.split(','), function(tagId) {
      $http.get('/api/tags/' + tagId).success(function(data) {
        $scope.tags.push(data);
      });
    });
  }

  if (galleryIds.length > 0) {
    _.forEach(galleryIds.split(','), function(tagId) {
      $http.get('/api/galleries/' + tagId).success(function(data) {
        $scope.galleries.push(data);
      });
    });
  }

  if ($routeParams.minDate) {
    var values = $routeParams.minDate.split('-');
    $scope.minDate = new Date(values[0], values[1] - 1, values[2]);
  }

  if ($routeParams.maxDate) {
    var values = $routeParams.maxDate.split('-');
    $scope.maxDate = new Date(values[0], values[1] - 1, values[2]);
  }

  var options = [];
  if (person_ids) {
    options.push('persons='+person_ids);
  }
  if (tagIds) {
    options.push('tags='+tagIds);    
  }
  if (galleryIds) {
    options.push('galleries='+galleryIds);
  }
  if (minDate) {
    options.push('minDate='+minDate);
  }
  if (maxDate) {
    options.push('maxDate='+maxDate);
  }

  if ($scope.personsOnly) {
    options.push('personsOnly=true');
  }

  if ($scope.tagsOnly) {
    options.push('tagsOnly=true');
  }

  if ($scope.galleriesOnly) {
    options.push('galleriesOnly=true');
  }

  $http.get('/api/images?action=search&' + options.join('&')).success(function(data) {
  	$scope.images = data;
  });

  $scope.edit = function() {
    var search = $location.search();
    $location.path('/search').search(search);
  };
}]);