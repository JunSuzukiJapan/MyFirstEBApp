
/**
 * Module dependencies.
 */

var flash = require('connect-flash')
  , express = require('express')
  , passport = require('passport')
  , util = require('util')
  , LocalStrategy = require('passport-local').Strategy
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , accounts = require('./accounts');

var app = express();

// all environments
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());

  app.use(express.cookieParser('fugafuga')); // set secret phrase
  app.use(express.session({secret: 'hogehoge'})); // set secret

  // Initialize Passport! Also use passport.session() middleware, to support
  // persistent login sessions (recommended).
  app.use(flash());
  app.use(passport.initialize());
  app.use(passport.session());

  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});


passport.serializeUser(function(user, done) {
  done(null, user); // ここの変数userが、ビューの○○.jadeに渡される。
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

var findById = accounts.findById;
var findByUsername = accounts.findByUsername;

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {

      // Find the user by username. If there is no user with the given
      // username, or the password is not correct, set the user to `false` to
      // indicate failure and set a flash message. Otherwise, return the
      // authenticated `user`.
      findByUsername(username, function(err, user) {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, { message: 'Unknown user ' + username + ' or invalid password.' });
        }
        if (user.password != password) {
          return done(null, false, { message: 'Unknown user ' + username + ' or invalid password.'  });
        }
        return done(null, user);
      })
    });
  }
));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/login', routes.login);
app.get('/signup', routes.signup);

app.post('/login',
  passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
  function(req, res) {
    res.redirect('/');
  }
);

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


app.post('/signup', function(req, res){
  accounts.signup(req, res, function(){
    passport.authenticate('local', { failureRedirect: '/signup', successRedirect: '/', failureFlash: true });
    res.redirect('/');
  });
});



// launch server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});