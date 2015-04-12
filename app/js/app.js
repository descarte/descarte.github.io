'use strict';

var URL_API = 'http://api-descarte.herokuapp.com';
//var URL_API = 'http://localhost:5000'

// Declare app level module which depends on filters, and services
var app = angular.module('DescarteOrg', [
	'ngRoute',
	//'DescarteOrg.filters',
	'DescarteOrg.services',
	'DescarteOrg.directives',
	'DescarteOrg.controllers',
	'mobile-angular-ui',  
	'mobile-angular-ui.gestures',
	'leaflet-directive'
])

.config(['$routeProvider', function($routeProvider) {
	$routeProvider.when('/', {
		templateUrl: '/app/partial/mapa.html',
		reloadOnSearch: false
	});
}])