app.directive('tags', function() {
  return {
    controller : function($scope, $http) {
      $scope.loadTags = function(query) {
        return $http.get('/api/tags?query=' + query);
      };

      $scope.onTagAdded = function(tag) {
        $http.post('/api/images/' + $scope.image.id + '/tags', tag).success(function(data) {
          if (!tag.id) {
            tag.id = data.id;
          }
        });
      };

      $scope.onTagRemoved = function(tag) {
        if (tag.id) {
          $http.delete('/api/images/' + $scope.image.id + '/tags/' + tag.id);	
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