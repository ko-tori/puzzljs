var express = require('express');
var router = express.Router();
var User = require('../models/user');
var passport = require('passport');
const { check, validationResult } = require('express-validator');

router.get('/', function (req, res) {
  res.render('home');
});

router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  await check('username', 'Username is invalid').trim().notEmpty().isAlphanumeric();
  await check('password', 'Password cannot be empty').notEmpty();

  const validationResults = validationResult(req);
  if (validationResults.isEmpty()) {
  let newUser = new User({ username: req.body.username });
    User.register(newUser, req.body.password, (e, user) => {
      if (user) {
        passport.authenticate('local')(req, res, function () {
          req.flash('success', `${user.username}'s account created successfully!`);
          res.redirect('/');
        });
      } else {
        req.flash('error', `Failed to create user account: ${e.message}.`);
        res.redirect('/register');
      }
    });
  } else {
    req.flash('error', validationResults.array().map(e => e.msg).join(' and '));
    res.redirect('/register');
  }
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed to login.',
  successRedirect: '/',
  successFlash: 'Logged in!'
}));

router.get('/logout', (req, res, next) => {
  req.logout();
  req.flash('success', 'You have been logged out!');
  res.redirect('/');
});

module.exports = router;