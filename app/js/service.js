'use strict';

angular.module('DescarteOrg.services', [])

.factory('ApiFactory', ['$http', function ($http) {
	var factory = {}; 

	factory.spots = function() {
		return $http.get(URL_API + '/spot/');
	};

	factory.spot = function(id) {
		return $http.get(URL_API + '/spot/'+ id);
	};

	factory.types = function() {
		return $http.get(URL_API + '/type/');
	};

	factory.materials = function() {
		return $http.get(URL_API + '/material/');
	};

	return factory;
}])
.service('FiltroService',function(ApiFactory){
	var self = this;
	self.filtrosType = {};
	var promisseTypes = ApiFactory.types().success(function(result){
		angular.forEach(result,function(item){
			item.check=true;
			self.filtrosType[item.id]=item;
		});
	}).error(function (error) {
		console.log(error);
	});


	self.filtrosMaterial = {};
	var promisseMaterials = ApiFactory.materials().success(function(result){
		angular.forEach(result,function(item){
			item.check=true;
			self.filtrosMaterial[item.id]=item;
		});
	}).error(function (error) {
		console.log(error);
	});
});
