var express= require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var assert = require('assert');
var path = require('path');
var cookieParser = require('cookie-parser');
var exphbs = require('express-handlebars');
var expressValidator = require('express-validator');
var flash = require('connect-flash');
var session = require('express-session');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var mongo = require('mongodb');
var mongoose = require('mongoose');
var MongoClient = mongo.MongoClient;

// TODO: JUST NOT SURE
mongoose.connect('mongodb://kskim4733:kylekim1234@ds127436.mlab.com:27436/bandroid');
// TODO: Change othername to bandroid
var db = mongoose.connection;

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout:'layout'}));
app.set('view engine', 'handlebars');

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));



app.use(cookieParser());

// Set Static Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session
app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

// Passport init
app.use(passport.initialize());
app.use(passport.session());

// Express Validator
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root    = namespace.shift()
      , formParam = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// Connect Flash
app.use(flash());

// Global Vars
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.user = req.user || null;
  next();
});


// TODO: Also not sure
app.use('/dashboard', routes);
app.use('/users', users);

//--------------------------------socket intializing------------------------------------------------------------------------------
var server = app.listen(process.env.PORT || 3000);
var io = require('socket.io')(server);

// io.on('connection', function (socket) {
//   socket.emit('news', 'MSG FROM PROF serverTEST ');
// });
//-------------------------prof db database intializing------------------------------------------------------------------------------
// var database_url = 'mongodb://localhost:27017/profDB';  //we will have two db one for prof's msg and one for user
var database_url = 'mongodb://kskim4733:kylekim1234@ds127436.mlab.com:27436/bandroid';  //we will have two db one for prof's msg and one for use

MongoClient.connect(database_url, function(err, db) {
	assert.equal(null, err);
  	console.log("Connected correctly to server");
  	db.createCollection("Messages", function(err, res) {
	    if (err) throw err;
	    console.log("Collection created!");
	    db.close();
  	});
});

//-----------------------setting up route for API Call--------------------------------------------------------------------------------------
app.get('/api/messages/',function(req,res){
//-----------------------getting all the previous data from the DB--------------------------------------------------------------------------
	MongoClient.connect(database_url, function(err, db) {
  	if (err) throw err;
  		db.collection("Messages").find({},{ _id: false}).toArray(function(err, result) {
    	if (err) throw err;
    	//sending result throught socket to the client
    	var return_list =[];
    	for(var i = 0, size = result.length; i < size ; i++){
		   var item = result[i]['msg'];
		   return_list.push(item);
		}
		return_list.reverse()
		io.on('connection', function (socket) {
		});
		res.send('GET: Sending Previous Message to Client Terminal '+ return_list);
		io.sockets.emit('news', return_list );

    	db.close();
  		});
	});
//---------------------------------------------------------------------------------------------------------------------------------------------

});

app.post('/api/messages/',function(req,res){ //create
	// io.on('connection', function (socket) {
	// });
	// res.send('POST: Message '+ req.params.msg);
	// io.sockets.emit('news', req.params.msg );
//-----------------------inserting message into database--------------------------------------------------------------------------------------
	MongoClient.connect(database_url, function(err, db) {
		if (err) throw err;
		var value =(req.body.data);
		var msgobj = { msg: value};
		db.collection("Messages").insertOne(msgobj, function(err, res) {
		if (err) throw err;
			console.log("1 message inserted");
			db.close();
		});
		db.collection("Messages").find({},{ _id: false}).toArray(function(err, result) {
	    	if (err) throw err;
	    	//sending result throught socket to the client
	    	var return_list =[];
	    	for(var i = 0, size = result.length; i < size ; i++){
			   var item = result[i]['msg'];
			   return_list.push(item);
			}
			return_list.reverse()
			io.on('connection', function (socket) {
			});
			io.sockets.emit('news', return_list );
	    	db.close();
  		});
		res.send('POST: '+ value);
	});
//------------------------------------------------------------------------------------------------------------------------------------------
});
app.delete('/api/messages/:msg',function(req,res){//delete
//-----------------------inserting message into database--------------------------------------------------------------------------------------
	MongoClient.connect(database_url, function(err, db) {
	  if (err) throw err;
	  var msgobj = { msg: req.params.msg };
	  // db.collection("Messages").deleteOne(msgobj, function(err, obj) {
	  db.collection("Messages").deleteMany(msgobj, function(err, obj) {
	    if (err) throw err;
	    console.log("1 message deleted");
	    db.close();
	  });
  	db.collection("Messages").find({},{ _id: false}).toArray(function(err, result) {
    	if (err) throw err;
    	//sending result throught socket to the client
    	var return_list =[];
    	for(var i = 0, size = result.length; i < size ; i++){
		   var item = result[i]['msg'];
		   return_list.push(item);
		}
		return_list.reverse()
		io.on('connection', function (socket) {
		});
		io.sockets.emit('news', return_list );
    	db.close();
		});
	res.send('DELETE: '+ req.params.msg);
	});
//------------------------------------------------------------------------------------------------------------------------------------------
});

