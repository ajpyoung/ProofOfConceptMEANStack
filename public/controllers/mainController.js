(function(){
	var MEANapp = angular.module('mainDemoController',["leaflet-directive","ui.bootstrap","jsondataDisplay","myDataServices"]);
	
	MEANapp.controller('mainPageController',['$scope','sharedData',function($scope,sharedData){
		$scope.inmemory=sharedData.getinMemoryJSON();
		$scope.indb=sharedData.getinDBJSON();
		$scope.checkedMemoryItems=[];
		$scope.checkedDBItems=[];
		$scope.maxDeleteMemory=0;
		$scope.currDeleteMemory=0;
		//watchers
		$scope.$watch(function(){
			return sharedData.getinDBJSON();
		},function(newvalue,oldvalue){
			if(newvalue===oldvalue){
				return;
			}
			$scope.indb = sharedData.getinDBJSON();
		});
		$scope.$watch(function(){
			return sharedData.getinMemoryJSON();
		},function(newvalue,oldvalue){
			if(newvalue===oldvalue){
				return;
			}
			$scope.inmemory = sharedData.getinMemoryJSON();
		});
	}]);

	MEANapp.controller("LayersSimpleController", [ '$scope','$http', "leafletData","sharedData",function($scope,$http,leafletData,sharedData) {

	    var drawnItems = new L.FeatureGroup(),
			//options = { edit: { featureGroup: drawnItems } },
			options = {
				position: 'topright',
				draw: {
					polyline: false,
					rectangle: false,
					polygon: {
						allowIntersection: false,
						showArea: true,
						drawError: {
							color: '#b00b00',
							timeout: 1000
						},
						shapeOptions: {
							color: '#bada55'
						}
					},
					circle: false
				},
				edit: {
					featureGroup: drawnItems,
					remove: false
				}
			},
			drawControl = new L.Control.Draw(options);

	    angular.extend($scope, {
	        center: {
	            lat: 10.315699,
	            lng: 123.885437,
	            zoom: 15
	        },
	        layers: {
	            baselayers: {
	                osm: {
	                    name: 'OpenStreetMap',
	                    url: 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	                    type: 'xyz'
	                }
	            }
	        },
	        defaults: {
	            scrollWheelZoom: true
	        },
	        controls: {
	            custom: [ drawControl ]
	        }

	    });
	    leafletData.getMap().then(function(map) {
			map.addLayer(drawnItems)

			map.on('draw:created', function (e) {
				var layer = e.layer;
				var GeoJSON_Data = layer.toGeoJSON();
				//drawnItems.addLayer(layer);
				//add target to group
				switch(e.layerType.toLowerCase())
				{
					case "marker":
						try{
							$scope.markers.push({
								lng:e.layer._latlng.lng,
								lat:e.layer._latlng.lat
							});
						}catch(error){
							$scope.markers=new Array();
							$scope.markers.push({
								lng:e.layer._latlng.lng,
								lat:e.layer._latlng.lat
							});
						}
						
						break;
					case "polygon":
						//save current geojson value;
						var tempgeojsonfeatures = new Array();
						try{
							for(var x=0;x<$scope.geojson.data.features.length;x++)
							{
								tempgeojsonfeatures.push($scope.geojson.data.features[x]);
							}
						}catch(error){
							$scope.geojson = {};
							$scope.geojson.data = {
								features:{},
								type:"FeatureCollection"
							};
							tempgeojsonfeatures = {};
						}						
						//clear geojson
						$scope.geojson = {};
						$scope.geojson.data = {
							features:{},
							type:"FeatureCollection"
						};
						try{
							tempgeojsonfeatures.push(GeoJSON_Data);	
						}catch(error){
							tempgeojsonfeatures=new Array();
							tempgeojsonfeatures.push(GeoJSON_Data);	
						}
						$scope.geojson.data.features = tempgeojsonfeatures;
						// for(var x=0;x<tempgeojsonfeatures.length;x++)
						// 	{
						// 		$scope.geojson.data.features.push(tempgeojsonfeatures[x]);
						// 	}
						//drawnItems.addLayer(layer);
						break;
				}
				//var GeoJSON_Data = layer.toGeoJSON();
				//$scope.saveCoordinates(null,GeoJSON_Data);
				//GeoJSON_Data.tracker = new Date()/1000;
				//console.log($scope.geojson);
				sharedData.addinMemoryJSON(GeoJSON_Data);
				//console.log(JSON.stringify(GeoJSON_Data));
			});
		});

		//using Angular to do our Ajax calls
		$scope.getCoordinates = function(id){
			var target = '';
			if(id==null)
			{
				target = '/coordinates/';
			}else{
				target = '/coordinates/'+id;
			}
			$http.get(target).
				success(function(data){
					//repopulate leaf.js
					sharedData.setinDBJSON(data);
					//start repopulating leaf.js
					if(!($scope.markers instanceof Array))
					{
						$scope.markers=new Array();
					}
					$scope.markers=new Array();
					$scope.geojson = {};
					$scope.geojson.data = {
						features:{},
						type:"FeatureCollection"
					};
					for(var x=0;x<data.length;x++)
					{
						switch((data[x]['geometry']['type']).toLowerCase())
						{
							case 'point':
								$scope.markers.push({
									lng:data[x]['geometry']['coordinates'][0],
									lat:data[x]['geometry']['coordinates'][1]
								});
								break;
							default:
								try{
									$scope.geojson.data.features.push(data[x]);	
								}catch(error){
									$scope.geojson.data.features=new Array();
									$scope.geojson.data.features.push(data[x]);	
								}
								break;
						}
						//console.log(data[x]);
					}
					//console.log($scope);
				}).
				error(function(data){
					console.log('Error '+target+' : '+data);
					alert('An Error occurred');
				});
		};
		$scope.saveCoordinates = function(id, GeoJSONData, index, type){
			var target = '';
			if(id==null)
			{
				target = '/coordinates/';
			}else{
				target = '/coordinates/'+id;
			}
			//GeoJSONData.index=index;
			var data = JSON.stringify(GeoJSONData);
			$http.put(target,data).
				success(function(data){
					//alert success
					//alert(data);
					//remove item from source type
					switch(type)
					{
						case "memory":
							$scope.currDeleteMemory++;
							if($scope.currDeleteMemory==$scope.maxDeleteMemory)
							{
								//clear map
								$scope.geojson={};
								$scope.markers={};
								// for(var x=0;x<$scope.maxDeleteMemory;x++)
								// {
								// 	console.log("deleting #"+$scope.checkedMemoryItems[x]);
								// 	if($scope.inmemory.length>1)
								// 	{
								// 		sharedData.deleteinMemroyJSON($scope.checkedMemoryItems[x]);
								// 	}else{
								// 		sharedData.setinMemoryJSON({});
								// 	}
								// }
								// sharedData.sortinMemoryJSON();
								// sharedData.cleanupinMemoryJSON();
								// //console.log($scope.inmemory);
								//clear memory
								sharedData.setinMemoryJSON({});
								$scope.getCoordinates();
								//console.log($scope.inmemory);

							}
							
							break;
						case "indb":
							break;
						default:
							break;
					}
				}).
				error(function(data){
					alert(data);
				})
		};
		$scope.checkedItem = function(source,index,event){
			//$scope.checkedMemoryItems=[];
			//$scope.checkedDBItems=[];
			//alert("im here");
			switch(source)
			{
				case 'memory':
					// console.log((event.target));
					// console.log((event.target).checked);
					if((event.target).checked)
					{
						if($scope.checkedMemoryItems.indexOf(event.target.value)===-1)
						{
							//add to list of checked memory indexes
							$scope.checkedMemoryItems.push(event.target.value);
							$scope.checkedMemoryItems.sort();
						}
					}else{
						$scope.checkedMemoryItems.splice($scope.checkedMemoryItems.indexOf(event.target.value),1);
					}
					//console.log($scope.checkedMemoryItems);
					break;
				case 'indb':
					break;
				default:
					break;
			}
		};
		$scope.saveCheckedMemory = function(){
			$scope.maxDeleteMemory=$scope.checkedMemoryItems.length;
			for(var x=0;x<$scope.checkedMemoryItems.length;x++)
			{
				$scope.saveCoordinates(null,$scope.inmemory[$scope.checkedMemoryItems[x]],$scope.checkedMemoryItems[x],"memory");
			}
		};
		//executes getCoordinates once the map is loaded
		$scope.$on("leafletDirectiveMap.load",function(event,args){
			$scope.getCoordinates();
		});

		
	} ]);
})();