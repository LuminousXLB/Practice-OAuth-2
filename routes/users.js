var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  function (username, password, done) {
    if (username === password) {
      return done(null, { username });
    } else {
      return done(null, false, { message: 'Incorrect username or password.' });
    }
  }
));

passport.serializeUser(function (user, done) {
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  done(null, { username });
});

/* GET users listing. */
router.get('/', function (req, res, next) {
  if (req.query.user) {
    res.render('hello', {
      'title': 'Login Success',
      'username': req.query.user
    })
  } else {
    res.send('respond with a resource');
  }
});

router.get('/login', function (req, res, next) {
  res.render('login');
});

router.post('/login',
  passport.authenticate('local', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function (req, res) {
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users?user=' + req.user.username);
  }
);

module.exports = router;
