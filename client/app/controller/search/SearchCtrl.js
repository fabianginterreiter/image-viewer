app.controller('SearchCtrl', ['$scope', '$http', '$routeParams', '$location', function($scope, $http, $routeParams, $location) {
  $scope.persons = [];
  $scope.tags = [];
  $scope.galleries = [];

  if ($routeParams.persons) {
    _.forEach($routeParams.persons.split(','), function(personId) {
      $http.get('/api/persons/' + personId).success(function(data) {
        $scope.persons.push(data);
      });
    });
  }

  if ($routeParams.tags) {
    _.forEach($routeParams.tags.split(','), function(id) {
      $http.get('/api/tags/' + id).success(function(data) {
        $scope.tags.push(data);
      });
    });
  }

  if ($routeParams.galleries) {
    _.forEach($routeParams.galleries.split(','), function(id) {
      $http.get('/api/galleries/' + id).success(function(data) {
        $scope.galleries.push(data);
      });
    });
  }

  if ($routeParams.minDate) {
    $scope.useMinDate = true;
    var values = $routeParams.minDate.split('-');
    $scope.minDate = new Date(values[0], values[1] - 1, values[2]);
  }

  if ($routeParams.maxDate) {
    $scope.useMaxDate = true;
    var values = $routeParams.maxDate.split('-');
    $scope.maxDate = new Date(values[0], values[1] - 1, values[2]);
  }

  $scope.personsOnly = $routeParams.personsOnly === 'true';
  $scope.tagsOnly = $routeParams.tagsOnly === 'true';
  $scope.galleriesOnly = $routeParams.galleriesOnly === 'true';

  $scope.loadPersons = function(query) {
  	return $http.get('/api/persons?query='+query);
  };

  $scope.loadTags = function(query) {
    return $http.get('/api/tags?query='+query);
  };

  $scope.loadGalleries = function(query) {
    return $http.get('/api/galleries?query='+query);
  };

  var getIds = function(objects) {
    var ids = [];

    _.forEach(objects, function(object) {
      ids.push(object.id);
    });

    return ids.join(',');
  };

  var getFormattedDate = function(date) {
    return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
  };

  $scope.search = function() {
    var options = {
      persons: getIds($scope.persons),
      
      tags: getIds($scope.tags),
      galleries: getIds($scope.galleries)
    };

    if ($scope.personsOnly) {
      options.personsOnly = 'true';  
    }

    if ($scope.tagsOnly) {
      options.tagsOnly = 'true';  
    }

    if ($scope.galleriesOnly) {
      options.galleriesOnly = 'true';  
    }
    
    if ($scope.useMinDate) {
      options.minDate = getFormattedDate($scope.minDate);
    }

    if ($scope.useMaxDate) {
      options.maxDate = getFormattedDate($scope.maxDate);
    }

  	$location.path('/search/result').search(options);
  };
}]);