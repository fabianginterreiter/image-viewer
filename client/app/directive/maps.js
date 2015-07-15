app.factory('MapsService', function($modal, $http) {
  return {
    setCoordinates : function(image, callback) {
    	$modal.open({
        animation: true,
        size: 'lg',
        templateUrl: 'templates/directives/maps/image.html',
        controller: function ($scope, $modalInstance, $http, $timeout) {
          $scope.cancel = function() {
            $modalInstance.dismiss('cancel');
          };

          $scope.save = function() {
            console.log("Set to Lon: " + $scope.lon + " Lat: " + $scope.lat);

            image.gps = true;
            image.latitude = $scope.lat;
            image.longitude = $scope.lon;

            $http.put('/api/images/' + image.id, image);

            $modalInstance.close();
          };

          $scope.clear = function() {
            console.log("Clear GPS");

            image.gps = false;
            image.latitude = 0.0;
            image.longitude = 0.0;

            $http.put('/api/images/' + image.id, image);

            $modalInstance.close();
          };

          $scope.marked = false;
          var setMarker = function(lon, lat) {
            if (!$scope.marked) {
              map.addOverlay(marker);
            }

            marker.setPosition(ol.proj.transform(
              [lon, lat],
              'EPSG:4326',
              'EPSG:3857'
            ));
          }

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
            		setZoom($scope.zoom);
            		setCenter($scope.lon, $scope.lat);

            		setMarker($scope.lon, $scope.lat);
  						}
  					}); 
					};

  				var map = new ol.Map({
        		layers: [
		          new ol.layer.Tile({
		            source: new ol.source.OSM() // source: new ol.source.MapQuest({layer: 'sat'})
		          })
		        ],
		        view: new ol.View({
		          minZoom: 1
		        })
		      });

          var setZoom = function(zoom) {
            map.getView().setZoom(zoom);
          };

          var setCenter = function(lon, lat) {
            map.getView().setCenter(ol.proj.transform([lon, lat], 'EPSG:4326', 'EPSG:3857'))
          };

  				map.on('singleclick', function(evt) {
            var lonlat = ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
            $scope.lon = lonlat[0];
            $scope.lat = lonlat[1];
             setMarker($scope.lon, $scope.lat);
          });

          var marker = new ol.Overlay({
            element: $('<img src="/images/marker.png" height="40px" width="40px" style="margin-top: -40px; margin-left: -20px;">')
          });

          setTimeout(function() {
          	map.setTarget('map');
          }, 50);

          if (image.gps) {
            setCenter(image.longitude, image.latitude);
            setMarker(image.longitude, image.latitude);
            setZoom(18);
          } else {
            navigator.geolocation.getCurrentPosition(function(position) {
              if (!image.gps) {
                return;
              }
              setCenter(position.coords.longitude, position.coords.latitude);
              setZoom(18);
            });  
          }
        }
      }).result.then(function() {
        if (callback) {
          callback();
        }
      });
    }
  };
});