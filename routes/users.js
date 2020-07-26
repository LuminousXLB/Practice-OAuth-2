var express = require('express');
var router = express.Router();
var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var axios = require('axios')


passport.use(new LocalStrategy(
  function (username, password, done) {
    if (username === password) {
      return done(null, { username });
    } else {
      return done(null, false, { message: 'Incorrect username or password.' });
    }
  }
));

passport.use('provider', new OAuth2Strategy({
  authorizationURL: 'http://localhost:4000/dialog/authorize',
  tokenURL: 'http://localhost:4000/oauth/token',
  clientID: 'abc123',
  clientSecret: 'ssh-secret',
  callbackURL: 'http://localhost:3000/users/login/callback'
},
  function (token, tokenSecret, profile, done) {
    console.log({ token, tokenSecret, profile })
    axios.get('http://localhost:4000/api/userinfo', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).then((response) => {
      done(null, {
        username: response.data.name,
        profile: response.data,
        token,
        tokenSecret
      });
    })
  }
));

passport.serializeUser(function (user, done) {
  console.log(user)
  done(null, user.username);
});

passport.deserializeUser(function (username, done) {
  console.log(username)
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

// Redirect the user to the OAuth provider for authentication.
router.get('/login/oauth', passport.authenticate('provider', { scope: 'basic' }));

// The OAuth provider has redirected the user back to the application.
// Finish the authentication process by attempting to obtain an access
// token.  If authorization was granted, the user will be logged in.
// Otherwise, authentication has failed.
router.get('/login/callback',
  passport.authenticate('provider', {
    failureRedirect: '/login',
    failureFlash: true
  }),
  function (req, res) {
    console.log(req, res)
    // If this function gets called, authentication was successful.
    // `req.user` contains the authenticated user.
    res.redirect('/users?user=' + req.user.username);
  }
);

module.exports = router;
