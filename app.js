'use strict'
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const passport = require('passport');
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
require('dotenv').load();
const cookieSession = require('cookie-session');

const routes = require('./routes/index');
const users = require('./routes/users');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.session({ secret: process.env.LINKEDIN_CLIENT_SECRET}));
app.use(cookieSession({ name: 'session', keys: ['key1', 'key2'] }));

app.use('/', routes);
app.use('/users', users);

app.get('/auth/linkedin',
passport.authenticate('linkedin'),
function(req, res){
  // The request will be redirected to LinkedIn for authentication, so this
  // function will not be called.
});

app.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  successRedirect: '/',
  failureRedirect: '/login'
}));
app.use(function (req, res, next) {
  res.locals.user = req.session.passport.user;
  next()
});

passport.use(new LinkedInStrategy({
  clientID: process.env.LINKEDIN_CLIENT_ID,
  clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
  callbackURL: process.env.HOST + "/auth/linkedin/callback",
  scope: ['r_emailaddress', 'r_basicprofile'],
  state: true
}, function(accessToken, refreshToken, profile, done) {
     done(null, {id: profile.id, displayName: profile.displayName, token: accessToken});
}));

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user)
});


app.get('/logout', function(req, res, next) {
  req.session = null;
  res.redirect('/');
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
