var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var hashPassword = models.hashPassword;

module.exports = function(passport) {

  router.post('/register', function(req, res) {
    if (!req.body.email) {

      res.json({success: false, error: "Email is missing."})

    } else if (!req.body.lastName) {

      res.json({success: false, error: "Last name is missing."})

    } else if (!req.body.firstName) {

      res.json({success: false, error: "First name is missing."})

    } else if (req.body.phone.length !== 10 || !(/^[0-9]+$/.test(req.body.phone))) {

      res.json({success: false, error: "Phone number must be 10 digits."})

    } else if (!req.body.password || req.body.password.length < 6) {

      res.json({success: false, error: "Password must be at least 6 characters long."})

    } else {

      User.findOne({email: req.body.email}, function(err, user) {
        if (err) {

          res.json({success: false, error: err})

        } else if (!user) {

          var newUser = new User({
            email: req.body.email,
            password: hashPassword(req.body.password),
            phone: req.body.phone,
            lastName: req.body.lastName,
            firstName: req.body.firstName
          })

          newUser.save(function(err) {

            if (err) {

              res.json({success: false, error: err})

            } else {

              res.json({success: true});

            }

          })

        } else {

          res.json({success: false, error: "Username already exist."})

        }
      })
    }
  })


  router.post("/login", passport.authenticate('local'), function(req,res) {
    console.log(req.user);
    if (!req.user) {
      res.json({success: false, error: "Failed to login."})
    } else {
      res.json({success: true, user: req.user._id})
    }
  })

  // router.get('/auth/facebook', passport.authenticate('facebook'));

  // router.get('/auth/facebook/callback',
  //   passport.authenticate('facebook', {successRedirect: "/", failureRedirect: '/login'}));

  // router.get('/auth/twitter', passport.authenticate('twitter'));

  // router.get('/auth/twitter/callback', 
  //   passport.authenticate('twitter', {successRedirect: "/", failureRedirect: '/login' }));

  router.get("/logout", function(req, res) {
    req.logout();
  })

  return router;
}