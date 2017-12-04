var express = require('express');
var router = express.Router();
var app = express();
const bodyParser = require("body-parser");
const methodOverride = require("method-override");
const morgan = require('morgan');

//const app = express();
//const PORT = process.env.PORT || 3001;

app.set("view engine", "ejs");

app.use(express.static('public'))

app.use(bodyParser.urlencoded({extended: false}));
app.use(methodOverride("_method"));

// Get Homepage
router.get('/', ensureAuthenticated, function(req, res){
	var temp = JSON.stringify(req.user);
	console.log(temp);
	res.render('index',{layout:false,username: temp });
});

function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		//req.flash('error_msg','You are not logged in');
		res.redirect('/users/login');
	}
}

// Support Routes
app.get('/dashboard', function (req, res) {
// res.send ("Welcome to our Server")
res.redirect('/courses');
});

app.get("/courses/create", (req, res) => {
res.render("courses/create");
});

app.get("/courses/:id/edit", (req, res) => {
res.render("courses/edit", {
	course: db.findOne(req.params.id)
});
});

// RESTful Routes
app.get("/courses", (req, res) => {
res.render("courses/index", {
	courses: db.findAll()
});
});

app.post("/courses", (req, res) => {
db.add({
	id: req.body.code,
	when: new Date(),
	what: req.body.what,
	who: req.body.who
});
res.redirect("/courses")
});


app.put("/courses/:id", (req, res) => {
db.add({
	id: req.params.id,
	when: new Date(),
	what: req.body.what,
	who: req.body.who
});  
res.redirect("/courses");
});

app.delete("/courses/:id", (req, res) => {
db.remove(req.params.id)
res.redirect("/courses");
});

// app.listen(PORT, () => {
// console.log(`Server listening on port ${PORT}`);
// });

const db = (function() {
let database = {
	'CSC309': { 
	id: 'CSC309',
	when: new Date(),
	what: 'Programming on the Web',
	who: 'Gonzalez'
	}
};

return { // public interface to the DB layer

	findAll: function () {
	return database
	},
	findOne: function (i) {
	return database[i]
	},
	add: function(r) {
	database[r.id] = r
	},
	remove: function(i) {
	delete database[i]
	}
};
})();

module.exports = router;
