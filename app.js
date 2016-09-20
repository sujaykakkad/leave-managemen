var express = require("express");
var app = express();
var path = require("path");
var bodyParser = require("body-parser");
var session = require("express-session");
var fs = require("fs");
var assert = require("assert")

var __config = require(path.join(__dirname, "config")); 
var __logger = require(path.join(__dirname, "lib", "logger"));
var __db = require(path.join(__dirname, "lib", "db"));

if (!fs.existsSync("logs"))
  fs.mkdirSync("logs");

app.disable("x-powered-by");

// Configuration
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(function (req, res, next) {
    __logger.info(req["method"] + " " + req.url);
    res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});

app.set("port", process.env.PORT || __config.port);

app.use(bodyParser.urlencoded({ extended: false}));

app.use(session({
    secret: __config.session.secret,
    resave: __config.session.resave,
    saveUninitialized: __config.session.saveUninitialized,
    maxAge: __config.session.maxAge,
    name: __config.session.name
}));

app.use(express.static(path.join(__dirname, 'public')));

// dynamically include routes (Controller)
var controller_path = path.join(__dirname, "controllers");
fs.readdirSync(controller_path).forEach(function (file) {
    if (file.substr(-3) == '.js') {
        require(path.join(controller_path, file))(app);
    }
});

__db.initialize(function (err) {
	assert.equal(null, err);
    __logger.info('started all databases');

    app.listen(app.get("port"), function () {
    	__logger.info("Express server listening on port %d", this.address().port);
	});

});