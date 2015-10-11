var express        = require('express');
var app            = express();
var router         = express.Router(); 
var mongoose       = require('mongoose');
var bodyParser     = require('body-parser');
var methodOverride = require('method-override');
var db             = require('./config/db');

var port = process.env.PORT || 8080; 

mongoose.connect(db.url);

if (process.argv[2] == 'setup') {
	var setup_models   = require('./config/setup');
	setup_models();
	console.log('Setup complete');
}

app.use(bodyParser.json()); 
app.use(bodyParser.json({ type: 'application/vnd.api+json' })); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('X-HTTP-Method-Override')); 
app.use(express.static(__dirname + '/public'));

require('./app/routes')(app, router);
app.listen(port);	
console.log('Started on localhost port ' + port);
exports = module.exports = app;
