var mongojs = require('mongojs')
var db = mongojs(GLOBAL.db_location,['coords']);
var ObjectID = mongojs.ObjectId;
// all routes from the server
//standard response to all resources is a JSON document

module.exports = function(router){
	//set our router for default root 
	router.route(/^\/.+\.(html|php|htm)/i)
		//set up our promise functions
		.get(function(req, res) {
			//server the demo landing page
			res.sendfile('./public/mystartpage.html'); // so this really doesn't have to be index.html
		});
	router.route('/')
		//set up our promise functions
		.get(function(req, res) {
			//server the demo landing page
			res.sendfile('./public/mystartpage.html'); // so this really doesn't have to be index.html
		});

	router.route('/coordinates/:coord_id')
		//pull data coordinates
		.get(function(req,res){

			if(req.params.coord_id==null)
			{
				//get all coordinates in the database
				db.coords.find({},function(err,doc){
					if(err==null)
					{
						res.json(doc);
					}else{
						sendError(err,res);
					}
				});
			}else{
				//get a specific coordinate; 
				db.coords.find({'_id':ObjectID(req.params.coord_id)},function(err,doc){
					if(err==null)
					{
						res.json(doc);
					}else{
						sendError(err,res);
					}
				});
			}
		})
		//update data coordinates
		.put(upsert)
		//create new data coordinates
		.post(upsert);
	router.route('/coordinates')
		//pull data coordinates
		.get(function(req,res){

			db.coords.find({},function(err,doc){
				if(err==null)
				{
					res.json(doc);
					console.log("GET: /coordinates \n"+doc);
				}else{
					sendError(err,res);
				}
			});
		})
		//update data coordinates
		.put(upsert)
		//create new data coordinates
		.post(upsert);
};

function sendError(err,res)
{
	var jsonERR = {
		type: "error",
		message: JSON.stringify(err)
	};
	res.json(jsonERR);
}

function upsert(req,res)
{
	// if(req.params.coord_id==null)
	// {
	// 	//don't do anything
	// 	var errorMSG = {
	// 		type: "error",
	// 		message: "Can't process request"
	// 	};
		
	// 	res.json(errorMSG);
	// }else{
		switch((req.body.geometry.type).toLowerCase())
		{
			case 'point':
				db.coords.update({'_id':new ObjectID(req.body._id)},
					{'$set': req.body },
					{upsert:true},function(err,doc){
						if(err==null){
							var errorMSG = {
								type: "success",
								message: "Information Saved"
							};
							res.json(errorMSG);
						}else{
							sendError(err,res)
						}
				});
				break;
			case 'polygon':

				db.coords.update({'_id':new ObjectID(req.body._id)},
					{'$set': req.body},
					{upsert:true},function(err,doc){
						if(err==null){
							var errorMSG = {
								type: "success",
								message: "Information Saved"
							};
							res.json(errorMSG);
						}else{
							sendError(err,res)
						}
				});
				break;
		}
		
	//} 
}