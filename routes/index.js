
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Home', user: req.user });
};

exports.login = function(req, res){
  res.render('login', { title: 'Login', user: req.user, message: req.flash('error') });
};

exports.signup = function(req, res){
  res.render('signup', { title: 'Signup', user: req.user });
};