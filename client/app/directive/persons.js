app.directive('persons', function() {
  return {
    controller : function($scope, $http, $timeout) {
      var click_y = 0;
      var click_x = 0;

      
      $scope.personSelecting = false;

      $scope.click = function(event) {
        $scope.person = null;
        $scope.personSelecting = true;

        var object = angular.element("#person_definer");

        click_y = event.offsetY / event.target.clientHeight;
        click_x = event.offsetX / event.target.clientWidth;

        object.css('top', event.offsetY + 'px');
        object.css('left', (event.offsetX - 150) + 'px');

        $timeout(function() {
          angular.element('#personSelector').focus();
        }, 100);

      };

      $scope.persons = [];

      $scope.updatePersons = function(person) {
        $http.get('/api/persons?query=' + person).success(function(data) {
          $scope.persons = [];
          _.forEach(data, function(person) {
            $scope.persons.push(person.name);
          });
        });
      };

      $scope.personSelect = function(person) {
        var person = {
          name: person,
          x: click_x,
          y: click_y
        };

        $http.post('/api/images/' + $scope.image.id + '/persons', person).success(function(data) {
          if (!$scope.image.persons) {
            $scope.image.persons = [];
          }
          $scope.image.persons.push(data);
        });

        $scope.personClose();
      };

      $scope.personClose = function() {
        $scope.person = '';
        $scope.persons = [];

        $scope.personSelecting = false;
      };

      var loadPersons = function() {
        if ($scope.image.id && !$scope.image.persons) {
          $http.get('/api/images/' + $scope.image.id + '/persons').success(function(data) {
            $scope.image.persons = data;
          });
        }
      };

      $scope.$watch('show', function(value) {
        loadPersons();
      });

      $scope.$watch('image', function() {
        if ($scope.show) {
          loadPersons();
        }
      });


    	$scope.deletePerson = function(person) {
        $http.delete('/api/images/' + $scope.image.id + '/persons/' + person.id).success(function(data) {
          _.remove($scope.image.persons, function(n) {
            return n.person_id === person.id;
          });
        });
      };
    },
    scope : {
      width : '=width',
      height : '=height',
      show : '=show',
      image : '=image',
      left : '=left'
    },
    templateUrl : 'templates/directives/persons.html'
  };
});