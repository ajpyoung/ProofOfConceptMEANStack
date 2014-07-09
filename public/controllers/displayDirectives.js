(function(){
	var mydirectives = angular.module('jsondataDisplay',[]);

	mydirectives.directive('inMemoryjson',function(){
		return{
			restrict:'EA',//E as an Element or A as a Attribute
			templateUrl:"./views/partials/InMemoryJSON.html"
		}
	});
	mydirectives.directive('inDbjson',function(){
		return{
			restrict:'EA',
			templateUrl:"./views/partials/InDBJSON.html"
		}
	})
})();