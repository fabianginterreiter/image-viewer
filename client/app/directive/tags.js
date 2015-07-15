app.directive('tags', function() {
  return {
    controller : function($scope, $element, $attrs, $http, usSpinnerService, ImageCache, $timeout, $modalStack, $location) {
     $scope.loadTags = function(query) {
	    return $http.get('/api/tags?query=' + query);
	  };

	  $scope.onTagAdded = function(tag) {
	  	$http.post('/api/images/' + $scope.id + '/tags', tag).success(function(data) {
	  		if (!tag.id) {
	  			tag.id = data.id;
	  		}
	  	});
	  };

	  $scope.onTagRemoved = function(tag) {
	  	if (tag.id) {
	  		$http.delete('/api/images/' + $scope.id + '/tags/' + tag.id);	
	  	}
	  };
    },

    restrict: 'E',
    scope: {
      image: '=image'
    },
    templateUrl: 'templates/directives/tags.html'
  };
});