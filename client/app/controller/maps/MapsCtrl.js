app.directive('map', function() {
  return {
    restrict: 'E',
    scope: {
      move: '&',
      points: '='
    },

    controller : function($scope, $http) {
 // Geometries
 // http://www.acuriousanimal.com/thebookofopenlayers3/chapter04_03_styling.html
            

          var textStyle = new ol.style.Text({
              textAlign: 'center'
            });

            $scope.clear = function() {
              vectorSource.clear();
            };

            // Source and vector layer
            var vectorSource = new ol.source.Vector({
                projection: 'EPSG:4326',
                features: []
            });

            var style = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(255, 100, 50, 0.3)'
                }),
                stroke: new ol.style.Stroke({
                    width: 2,
                    color: 'rgba(255, 100, 50, 0.8)'
                }),
                image: new ol.style.Circle({
                    fill: new ol.style.Fill({
                        color: 'rgba(55, 200, 150, 0.5)'
                    }),
                    stroke: new ol.style.Stroke({
                        width: 1,
                        color: 'rgba(55, 200, 150, 0.8)'
                    })
                }),
                text: new ol.style.Text({
                  textAlign: 'center'
                })
            });

            var vectorLayer = new ol.layer.Vector({
              source: vectorSource,
              style: style
            });

            // Maps
            var map = new ol.Map({
                target: 'map',  // The DOM element that will contains the map
                renderer: 'canvas', // Force the renderer to be used
                layers: [
                    // Add a new Tile layer getting tiles from OpenStreetMap source
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    }),
                    vectorLayer
                ],
                // Create a view centered on the specified location and zoom level
                view: new ol.View({
                    center: ol.proj.transform([2.1833, 41.3833], 'EPSG:4326', 'EPSG:3857'),
                    zoom: 4
                })
            });


      $scope.$watch('points', function(oldPoints, newPoints) {

        $scope.clear();


          _.forEach(newPoints, function(point) {
            console.log(point.radius);
            var n = point.images.length;
            var radius = map.getView().getResolution() * 10 * (n > 6 ? 6 : n);

              var point = new ol.geom.Circle(
                  ol.proj.transform([point.longitude, point.latitude], 'EPSG:4326', 'EPSG:3857'),
                  radius
              );

              var pointFeature = new ol.Feature(point);

              vectorSource.addFeature(pointFeature);
          });

            
      });

      map.on('moveend', function(event) {
        if (!$scope.move) {
          return;
        }

        var corner1 = map.getView().calculateExtent(map.getSize());

        var lonlat = ol.proj.transform([
          corner1[0], corner1[1]
        ], 'EPSG:3857', 'EPSG:4326');

        var lonlat2 = ol.proj.transform([
          corner1[2], corner1[3]
        ], 'EPSG:3857', 'EPSG:4326');

        $scope.move({
          lon1: lonlat[0], 
          lat1: lonlat[1], 
          lon2: lonlat2[0], 
          lat2: lonlat2[1]
        });
      });
    },

    templateUrl: 'templates/directives/map.html'
  };
});

var max = function(val1, val2) {
  if ((val1 < 0 && val2 > 0) || (val1 > 0 && val2 < 0)) {
    return Math.abs(val1) + Math.abs(val2);
  }

  return Math.abs(val1 - val2);
};

var calcCenter = function(images) {
  var sumLon = 0;
  var sumLat = 0;

  var maxLon = null;
  var maxLat = null;
  var minLon = null;
  var minLat = null;
  var first = true;

  _.forEach(images, function(image) {
    if (first) {
      maxLon = image.longitude;
      minLon = image.longitude;
      maxLat = image.latitude;
      minLat = image.latitude;
      first = false;
      return;
    }

    if (maxLon < image.longitude) {
      maxLon = image.longitude;
    } else if (minLon > image.longitude) {
      minLon = image.longitude;
    }

    if (maxLat < image.latitude) {
      maxLat = image.latitude;
    } else if (minLat > image.latitude) {
      minLat = image.latitude;
    }
  });

  var radius = ((maxLon - minLon + maxLat - minLat) / 2);

  var result = {
    longitude : minLon + (maxLon - minLon) / 2,
    latitude : minLat + (maxLat - minLat) / 2,
    radius : (radius > 1 ? radius : 1)
  };

  return result;
}

function toRad(x) {return x * Math.PI / 180;}

function SphericalCosinus(lat1, lon1, lat2, lon2) {

    var R = 6371; // km
    var dLon = toRad(lon2 - lon1),
        lat1 = toRad(lat1),
        lat2 = toRad(lat2),
        d = Math.acos(Math.sin(lat1)*Math.sin(lat2) + Math.cos(lat1)*Math.cos(lat2) * Math.cos(dLon)) * R;


    return d;
}


app.controller('MapsCtrl', ['$scope', '$http', function($scope, $http) {

  $scope.move = function(lon1, lat1, lon2, lat2) {
    $http.get('/api/images?action=coordinates&lat1=' + lat1 + '&lon1=' + lon1 + '&lat2=' + lat2 + '&lon2=' + lon2).success(function(data) {
      var points = [];

      var lonMax = max(lon1, lon2) / 10;
      var latMax = max(lat1, lat2) / 10;

      _.forEach(data, function(image) {
        var added = false;

        _.forEach(points, function(point) {
          if (max(point.longitude, image.longitude) < lonMax && max(point.latitude, image.latitude) < latMax) {
            point.images.push(image);
            added = true;
            var c = calcCenter(point.images);
            point.longitude = c.longitude;
            point.latitude = c.latitude;
            return;
          }
        });

        if (!added) {
          points.push({
            longitude: image.longitude,
            latitude: image.latitude,
            images: [ image ]
          });
        }
      });

      $scope.points = points;
    });
  };

  $scope.points = [
  ];


 /* $scope.search = function(value) {
  	$http.get('http://nominatim.openstreetmap.org/search?format=json&q=' + value).success(function(data) {
  		if (data && data.length > 0) {
  			$scope.lat = parseFloat(data[0].lat, 10);
            $scope.lon = parseFloat(data[0].lon, 10);

            console.log("Lat: " + $scope.lat);
            console.log("Lon: " + $scope.lon);

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
  };*/

  	/*

  	map.on('singleclick', function(evt) {
      var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
      $scope.lon = lonlat[0];
      $scope.lat = lonlat[1];

      marker.setPosition(ol.proj.transform(
			  [$scope.lon, $scope.lat],
		    'EPSG:4326',
		    'EPSG:3857'
		  ));

      var corner1 = map.getView().calculateExtent(map.getSize());

      var lonlat = ol.proj.transform([
        corner1[0], corner1[1]
      ], 'EPSG:3857', 'EPSG:4326');

      var lonlat2 = ol.proj.transform([
        corner1[2], corner1[3]
      ], 'EPSG:3857', 'EPSG:4326');

      console.log('Lo1-:' + lonlat[0]);
      console.log('La1-:' + lonlat[1]);
      console.log('Lo2-:' + lonlat2[0]);
      console.log('La2-:' + lonlat2[1]);

      getImages(lonlat[0], lonlat[1], lonlat2[0], lonlat2[1]);
    });

    var getImages = function(lon1, lat1, lon2, lat2) {
      $http.get('/api/images?action=coordinates&lat1=' + lat1 + '&lon1=' + lon1 + '&lat2=' + lat2 + '&lon2=' + lon2).success(function(data) {
        console.log(data);

        if (data.length === 0) {
          return;
        }

        new ol.interaction.Draw({
          source: source,
          type: 'Circle',
          geometryFunction: geometryFunction,
          maxPoints: maxPoints
        });

        map.addInteraction(draw);
      });      
    }

  	var marker = new ol.Overlay({
      position: ol.proj.transform(
        [-122.332071, 47.606209],
        'EPSG:4326',
        'EPSG:3857'
      ),
      element: $('<img src="/images/marker.png" height="40px" width="40px" style="margin-top: -40px; margin-left: -20px;">')
    });

    map.addOverlay(marker);*/
}]);