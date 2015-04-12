angular.module('DescarteOrg.controllers', [])

.controller('ContextController', ['$rootScope','$scope','FiltroService', function($rootScope, $scope, FiltroService){
	// User agent displayed in home page
	$scope.userAgent = navigator.userAgent;

	// Needed for the loading screen
	$rootScope.$on('$routeChangeStart', function(){
		$rootScope.loading = true;
	});

	$rootScope.$on('$routeChangeSuccess', function(){
		$rootScope.loading = false;
	});
	$scope.FiltroService = FiltroService;
	
	$scope.filterChanged = function(){
		$rootScope.$broadcast('filterchange');
	}

	$scope.new = function() {
		$rootScope.$broadcast('new-descarte', { spot: 1 });
	};
}])

.controller('MapController', ['$rootScope', '$scope', 'ApiFactory','FiltroService', function ($rootScope, $scope, ApiFactory, FiltroService) {
	$scope.listaLocais = {};
	
	$scope.center = {
		lat: -30.0330600,
		lng: -51.2300000,
		zoom: 11
	};
	
	$scope.defaults = {
		maxZoom: 20,
		minZoom: 7,
		center: $scope.center,
		attributionControl: false
	};
	
	$scope.locaisFiltrados = {};

	function filtrarLista(){
		angular.forEach($scope.listaLocais,function(item){
			$scope.locaisFiltrados[item.id]=estaSpotVisivel(item)?
				item:undefined;
		});
	}
	function estaSpotVisivel(spot){
		return $scope.FiltroService.filtrosType[spot.Type.id].check 
		&& spot.Materials.filter(function(item){return $scope.FiltroService.filtrosMaterial[item.id].check;}).length>0
		;
	};
	
	$scope.layers = {
		"baselayers": {
			osm: {
				name: 'OpenStreetMap',
				type: 'xyz',
				url: 'http://{s}.tile.openstreetmap.se/hydda/full/{z}/{x}/{y}.png',
				layerOptions: {
					subdomains: ['a', 'b', 'c'],
					attribution: 'Tiles courtesy of <a href="http://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
					continuousWorld: true
				}
			},
		},
		"overlays":{
			"spots": {
				"name": "spots",
				"type": "markercluster",
				"visible": true,
				"layerOptions":{
					"maxClusterRadius":15
				}      			
			}
		}
	};
	if (navigator.geolocation) {
		navigator.geolocation.getCurrentPosition(function(position){
			$scope.center.lng=position.coords.longitude;
			$scope.center.lat=position.coords.latitude;
		});
	}
	var iconePath = "/app/image/markers/"
	ApiFactory.spots().success(function(spots) {
		spots.forEach(function(e){
			e.message = '<b>'+ e.name +'</b><br/>'+ e.Type.name +'<br/><a ui-toggle="uiSidebarRight" href="javascript:void(0);">Mais informações</a>';
			e.layer="spots";
			e.icon = {
				iconUrl: iconePath+ e.Type.id + ".png"
			};
			$scope.listaLocais[e.id] = e;
			$scope.locaisFiltrados[e.id] = e; 
		});
	}).error(function (error) {
		console.log(error);
	});

	$scope.$on('leafletDirectiveMarker.click', function(e, args) {
		$rootScope.$broadcast('detail-id', { spot: $scope.listaLocais[args.markerName] });
	});


	$scope.new = function() {
		$rootScope.$broadcast('new-descarte', { lat: $scope.center.lat, lng: $scope.center.lng});
	};

	$scope.$on('filterchange', function(e, args) {
		filtrarLista();
	});
}])

.controller('SidebarRightController', ['$scope', 'ApiFactory', function ($scope, ApiFactory) {
	$scope.spot;
	$scope.address;

	$scope.$on('detail-id', function(event, args) {
		$scope.operation = 'detail';
		$scope.spot = args.spot;
		var geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng($scope.spot.lat, $scope.spot.lng);
		geocoder.geocode({ 'latLng': latlng }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					$scope.address = results[0].formatted_address;
				} else {
					console.log('Location not found');
				}
			} else {
				console.log('Geocoder failed due to: ' + status);
			}
		}); 
	});

	$scope.$on('new-descarte', function(event, args) {
		$scope.operation = 'new';
		$scope.lat = args.lat;
		$scope.lng = args.lng;
		$scope.material = {
			ids: { }
		};

		var geocoder = new google.maps.Geocoder();
		var latlng = new google.maps.LatLng($scope.lat, $scope.lng);
		geocoder.geocode({ 'latLng': latlng }, function (results, status) {
			if (status == google.maps.GeocoderStatus.OK) {
				if (results[0]) {
					$scope.address = results[0].formatted_address;
				}
			}
		}); 

		ApiFactory.materials().success(function(materials) {
			$scope.materials = materials;
		}).error(function (error) {
			console.log(error);
		});

		ApiFactory.situations().success(function(situations) {
			$scope.situations = situations;
		}).error(function (error) {
			console.log(error);
		});
	});

	$scope.save = function(){
		var d = {
			title: $scope.title,
			lat: $scope.lat,
			lng: $scope.lng,
			name: $scope.name,
			email: $scope.email,
			description: $scope.description,
			SituationId: $scope.SituationId,
			Materials: Object.keys($scope.material.ids)
		};
		ApiFactory.discard(d).success(function(discard) {
			$scope.discard = discard;
		}).error(function (error) {
			console.log(error);
		});
	}

}])
