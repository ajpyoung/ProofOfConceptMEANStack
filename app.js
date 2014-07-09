// inital setup

var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var logger = require('morgan');
GLOBAL.router = express.Router();
var port = process.env.PORT || 9876;
GLOBAL.db_location = 'mapDB';

// configuration ===============================================================

if(process.env.NODE_ENV=='development'){
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(logger('dev')); 						// log every request to the console
	app.use(bodyParser.json()); 							// parse application/json
	app.use(bodyParser.urlencoded({extended:true}));		// parse application/x-www-form-urlencoded
	GLOBAL.db_location = 'mapDB';
}else{
	app.use(express.static(__dirname + '/public')); 		// set the static files location /public/img will be /img for users
	app.use(logger()); 								// log every request to the console - default settings
	app.use(bodyParser.json()); 							// parse application/json
	app.use(bodyParser.urlencoded({extended:true}));		// parse application/x-www-form-urlencoded
	GLOBAL.db_location = 'mapDB';
}

//load the routes
require('./server/routes')(GLOBAL.router);

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be from root /
app.use('/', GLOBAL.router);

//start our server
app.listen(port);
console.log('starting server at port '+port);