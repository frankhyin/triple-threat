"use strict";

var fs = require('fs');
var path = require('path');

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
//var FacebookStrategy = require('passport-facebook');
//var TwitterStrategy = require('passport-twitter');
var routes = require('./routes/index');
var auth = require('./routes/auth');
var models = require('./models/models');
var hashPassword = models.hashPassword;
var User = models.User;


var app = express();

if (! fs.existsSync('./env.sh')) {
  throw new Error('env.sh file is missing');
}
if (! process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not in the environmental variables. Try running 'source env.sh'");
}

mongoose.connection.on('connected', function() {
  console.log('Success: connected to MongoDb!');
});
mongoose.connection.on('error', function() {
  console.log('Error connecting to MongoDb. Check MONGODB_URI in env.sh');
  process.exit(1);
});
mongoose.connect(process.env.MONGODB_URI);


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

var session = require("express-session");
var MongoStore = require('connect-mongo')(session);
app.use(session({
  secret: "wonder woman",
  store: new MongoStore({mongooseConnection: require('mongoose').connection}),
  proxy: true,
  resave: true,
  saveUninitialized: true,
  cookie: {maxAge: 60*60*1000}
}));

passport.serializeUser(function(user, done) {
  console.log("serialize");
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
  console.log("deserialize");
  User.findById(id, function(err, user) {
    done(err, user);
  });
});

passport.use(new LocalStrategy({usernameField: 'email', passwordField: 'password'}, function(username, password, done) {
  console.log('local', username, password);
  User.findOne({email: username}, function(err, user) {
    if (err) {
      return done(err);
    }

    if (!user) {
      return done(null, false)
    }

    if (user.password !== hashPassword(password)) {
      return done(null, false)
    }

    return done(null, user)
  })
}))

app.use(passport.initialize());
app.use(passport.session());

app.use('/', auth(passport));
app.use('/', routes);


console.log('Express started. Listening on port', process.env.PORT || 3000);
app.listen(process.env.PORT || 3000);