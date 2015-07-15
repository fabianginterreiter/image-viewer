app.controller('MapsCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.search = function(value) {

  	$http.get('http://nominatim.openstreetmap.org/search?format=json&q=' + value).success(function(data) {
  		if (data && data.length > 0) {
  			$scope.lat = parseFloat(data[0].lat, 10);
            $scope.lon = parseFloat(data[0].lon, 10);

            switch (data[0].class) {
            	case 'building':
            	case 'attraction':
            	$scope.zoom = 18;
            	break;
            	case 'city':
            	$scope.zoom = 9;
            	break
            	default:
            	$scope.zoom = 12
            }

            //map.getView().getCenter()[0] = $scope.lat;
            //map.getView().getCenter()[1] = $scope.lon;
            console.log(map.getView());

            map.getView().setZoom($scope.zoom);

            map.getView().setCenter(ol.proj.transform([$scope.lon, $scope.lat], 'EPSG:4326', 'EPSG:3857'));

            marker.setPosition(ol.proj.transform(
			    [$scope.lon, $scope.lat],
			    'EPSG:4326',
			    'EPSG:3857'
			  ));
  		}
  	}); 

  	 };

  	var map = new ol.Map({
        target: 'map',
        layers: [
          new ol.layer.Tile({
            source: new ol.source.OSM() // source: new ol.source.MapQuest({layer: 'sat'})
          })
        ],
        view: new ol.View({
          center: ol.proj.transform([37.41, 8.82], 'EPSG:4326', 'EPSG:3857'),
          zoom: 4,
          minZoom: 1
        })
      });

  	map.on('singleclick', function(evt) {

  var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
  $scope.lon = lonlat[0];
  $scope.lat = lonlat[1];

 marker.setPosition(ol.proj.transform(
			    [$scope.lon, $scope.lat],
			    'EPSG:4326',
			    'EPSG:3857'
			  ));
});

  	var marker = new ol.Overlay({
  position: ol.proj.transform(
    [-122.332071, 47.606209],
    'EPSG:4326',
    'EPSG:3857'
  ),
  element: $('<img src="/images/marker.png" height="40px" width="40px" style="margin-top: -40px; margin-left: -20px;">')
});

  	console.log(marker);

map.addOverlay(marker);

  	/*$scope.$on('openlayers.map.singleclick', function(event, data) {
  			console.log(data);
                $scope.$apply(function() {
                    if ($scope.projection === data.projection) {
                        $scope.mouseclickposition = data.coord;
                        console.log("test");

                        $scope.lat = data.coord[0];
                        $scope.lon = data.coord[1];
                    } else {
                        var p = ol.proj.transform([ data.coord[0], data.coord[1] ], data.projection, $scope.projection);
                        $scope.mouseclickposition = {
                            lat: p[1],
                            lon: p[0],
                            projection: $scope.projection
                        };

                        $scope.lat = $scope.mouseclickposition.lat;
                        $scope.lon = $scope.mouseclickposition.lon;

                        
                    }

                    

                       $scope.mouseclickposition

                      console.log($scope.lat + " # " + $scope.lon);
                });
            });


	$scope.defaults = {
        events: {
            map: [ 'singleclick' ]
        }
    };

    $scope.mouseposition = {};
    $scope.mouseclickposition = {};
    $scope.projection = 'EPSG:4326';

  	$scope.center = {};
 	$scope.center.lat = 51.505;
    $scope.center.lon = -0.09;

$scope.lat = 51.505;
$scope.lon = -0.09;

    $scope.center.zoom = 13;*/
}]);