(function(){
	var dataServices = angular.module('myDataServices',[]);

	dataServices.service('sharedData',function(){
		var inMemoryJSON=[];
		var inDBJSON=[];

		return{
			getinMemoryJSON:function(){
				return inMemoryJSON;
			},
			getinDBJSON:function(){
				return inDBJSON;
			},
			setinMemoryJSON:function(dataObject){
				inMemoryJSON=dataObject;
			},
			setinDBJSON:function(dataObject){
				inDBJSON=dataObject;
			},
			addinMemoryJSON:function(dataObject){
				inMemoryJSON.push(dataObject);
			},
			addinDBJSON:function(dataObject){
				inDBJSON.push(dataObject);
			},
			deleteinMemroyJSON:function(index){
				delete inMemoryJSON[index];
			},
			sortinMemoryJSON:function(){
				try{
					inMemoryJSON.sort();
				}catch(error){
					console.log(error);
				}
			},
			generateTrackerinMemoryJSON:function(){
				for(var x=0;x<inMemoryJSON.length;x++)
				{
					try{
						inMemoryJSON[x].tracker = new Date()/1000;
					}catch(error){
						console.log(error);
					}
				}
			},
			cleanupinMemoryJSON:function(){
				if(inMemoryJSON.length==undefined)
				{
					inMemoryJSON=new Array();
				}
				for(var x=0;x<inMemoryJSON.length+1;x++)
				{
					if(inMemoryJSON[x]==undefined)
					{
						if(inMemoryJSON.length>1)
						{
							inMemoryJSON.splice(x,1);
						}else{
							inMemoryJSON=new Array();
						}
					}
				}
				console.log(inMemoryJSON);
			}
		}
	});
})();