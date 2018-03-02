"use strict";

const express = require('express');
var mongoose = require('mongoose');

const router = express()

// Models
const User = mongoose.model('User', {
  fname: String,
  lname: String,
  email: String,
  password: String
})

// Routes

// register user
router.post('/register', (req, res) => {
  // if all required fields are filled out
  if (req.body.firstName && req.body.lastName && req.body.email && req.body.password) {
    // create new user from input fields
    const newUser = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password
    })
    // save new user to database
    newUser.save((error) => {
      if (error) {
        console.log(error);
      } else {
        console.log('New user registered')
        // find user in database
        User.find((error, user) => {
          console.log('User found')
        })
      }
    })
  // user is missing one or more fields
  } else {
    res.send('Please fill out all forms');
  }
})

// login
router.post('/login', (req, res) => {
  // if user has filled out both fields
  if (req.body.email && req.body.password) {
    // find user in the database with that email
    User.findOne({
      email: req.body.email
    }), (error, currentUser) => {
      if (error) {
        console.log(error)
      } else {
        // if correct password is entered
        (if req.body.password === currentUser.password) {
          // create new token based off user's email
          const tokenStr = req.body.email
          const newToken = new Token({
            userId: currentUser._id,
            token: tokenStr,
            createdAt: new Date(),
          });
          // save token
          newToken.save((error) => {
            if (error) {
              console.log(error)
            } else {
              console.log('Login success')
              // send json
              res.json({
                success: true,
                response: {
                  id: currentUser._id,
                  token: tokenStr
                }
              })
            }
          })
        // wrong password
        } else {
          res.send('Invalid login')
        }
      }
    }
  }
})
