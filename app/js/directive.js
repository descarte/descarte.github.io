'use strict';


angular.module('DescarteOrg.directives', [])

.directive('dragToDismiss', function($drag, $parse, $timeout){
	return {
		restrict: 'A',
		compile: function(elem, attrs) {
			var dismissFn = $parse(attrs.dragToDismiss);
			return function(scope, elem, attrs){
				var dismiss = false;

				$drag.bind(elem, {
					constraint: {
						minX: 0, 
						minY: 0, 
						maxY: 0 
					},
					move: function(c) {
						if( c.left >= c.width / 4) {
							dismiss = true;
							elem.addClass('dismiss');
						} else {
							dismiss = false;
							elem.removeClass('dismiss');
						}
					},
					cancel: function(){
						elem.removeClass('dismiss');
					},
					end: function(c, undo, reset) {
						if (dismiss) {
							elem.addClass('dismitted');
							$timeout(function() { 
								scope.$apply(function() {
									dismissFn(scope);  
								});
							}, 400);
						} else {
							reset();
						}
					}
				});
			};
		}
	};
})