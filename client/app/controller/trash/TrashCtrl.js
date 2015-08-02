app.controller('TrashCtrl', ['$scope', '$http', 'Dialogs', function($scope, $http, Dialogs) {
  $http.get('/api/trash').success(function(data) {
    $scope.images = data;
  });

  var getSelected = function() {
    var selected = [];
    $scope.images.forEach(function(image) {
      if (image.selected) {
        selected.push(image);
      }
    });
    return selected;
  };

  $scope.delete = function() {
    Dialogs.delete('Delete', 'Do you really want to delete all the files?', function() {
      $http.delete('/api/trash/clear').success(function(data) {
        $scope.images = [];
      });
    });
  };

  $scope.restore = function() {

  	var selected = getSelected();

  	var ids = [];
    selected.forEach(function(image) {
      ids.push(image.id);
    });

  	$http.put('/api/trash/restore/' + ids.join('+')).success(function(data) {

    });
  };
}]);