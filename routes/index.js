var express = require('express');
var router = express.Router();
var models = require('../models/models');
var User = models.User;
var Ping = models.Ping;
var Message = models.Message;
var hashPassword = models.hashPassword;

//REGISTER NEW USER
router.post('/register', function(req, res) {
  if (!req.body.username) {
    res.json({success: false, error: "Username is missing."})
  } else if (!req.body.lastName) {
    res.json({success: false, error: "Last name is missing."})
  } else if (!req.body.firstName) {
    res.json({success: false, error: "First name is missing."})
  } else if (req.body.phone.length !== 10 || !(/^[0-9]+$/.test(req.body.phone))) {
    res.json({success: false, error: "Phone number must be 10 digits."})
  } else if (!req.body.password || req.body.password.length < 6) {
    res.json({success: false, error: "Password must be at least 6 characters long."})
  } else {
    User.findOne({username: req.body.username}, function(err, user) {
      if (err) {
        res.json({success: false, error: err})
      } else if (!user) {
        var newUser = new User({
          username: req.body.username,
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

//LOG IN
router.post("/login", function(req,res) {
  if (!req.body.username) {
    res.json({success: false, error: "Username is missing."})
  } else if (!req.body.password) {
    res.json({success: false, error: "Password is missing."})
  } else {
    User.findOne({username: req.body.username, password: hashPassword(req.body.password)}, function(err, user) {
      if (err) {
        res.json({success: false, error: err})
      } else if (!user) {
        res.json({success: false, error: 'Invalid credentials.'})
      } else {
        res.json({success: true, user: user._id})
      }
    })
  }
})

//LOG OUT
router.get("/logout", function(req, res) {
  req.logout();
})

//GET ALL ACTIVE PINGS
router.get("/ping", function(req, res) {
  Ping.find({active: true}).exec(function(err, pings) {
    if (err) {
      res.json({success: false, error: err})
    } else {
      res.json({success: true, pings: pings})
    }
  })
})

//POST NEW PING
router.post("/ping/new", function(req, res) {
  var newPing = new Ping({
    pingContent: req.body.pingContent,
    begin: new Date(),
    //end: req.body.endTime,
    user: req.body.user_id
  })

  newPing.save(function(err) {
    if (err) {
      res.json({success: false, error: err})
    } else {
      res.json({success: true})
    }
  })
})

router.get("/messages", function(req, res) {
  Message.find().exec(function(err, messages) {
    if (err) {
      res.json({success: false, error: err})
    } else {
      res.json({success: true, messages: messages})
    } 
  })
})

router.post("/messages/new", function(req, res) {
  User.findById(req.body.user_id, function(err, user) {
    if (err) {
      res.json({success: false, error: err})
    } else {
      var newMess = new Message({
      owner: user.firstName + ' ' + user.lastName,
      owner_id: req.body.user_id,
      content: req.body.content,
      time: new Date()
    })
      newMess.save(function(err) {
        if (err) {
          res.json({success: false, error: err})
        } else {
          res.json({success: true})
        }
      })
    }
  })
})

//LOAD PING INFO & MESSAGES
// router.get("/ping/:ping_id", function(req, res) {
//   Ping.findById(req.params.ping_id, function(err, ping) {
//     if (err) {
//       res.json({success: false, error: err})
//     } else if (!ping) {
//       res.json({success: false, error: 'Invalid Ping ID'})
//     } else {
//       Message.find({ping: req.params.ping_id}, function(err, messages) {
//         if (err) {
//           res.json({success: false, error: err})
//         } else {
//           res.json({success: true, ping: ping, messages: messages})
//         }
//       })
//     }
//   })
// })



//POST NEW MESSAGE
// router.post("/ping/:ping_id", function(req, res) {
//   Ping.findById(req.params.ping_id, function(err, ping) {
//     if (err) {
//       res.json({success: false, error: err})
//     } else if (!ping) {
//       res.json({success: false, error: 'Invalid Ping ID'})
//     } else {
//       var newMessage = new Message({
//         ping: req.params.ping_id,
//         user: req.body.user_id,
//         time: new Date(),
//         content: req.body.content
//       })
//       newMessage.save(function(err) {
//         if (err) {
//           res.json({success: false, error: err})
//         } else {
//           res.json({success: true})
//         }
//       })
//     }
//   })
// })

//ARCHIVE PING
// router.delete("/ping/:ping_id", function(req, res) {
//   Ping.findById(req.params.ping_id, function(err, ping) {
//     if (err) {
//       res.json({success: false, error: err})
//     } else if (!ping) {
//       res.json({success: false, error: 'Invalid Ping ID'})
//     } else {
//       Ping.findByIdAndUpdate({active: false}, function(err) {
//         if (err) {
//           res.json({success: false, error: err})
//         } else {
//           res.json({success: true})
//         }
//       })
//     }
//   })
// })

//GET USER PROFILE
router.get("/profile/:user_id", function(req, res) {

  User.findById(req.params.user_id, function(err, user) {
    if (err) {
      res.json({success: false, error: err})
    } else if (user) {
      res.json({success: true, user: user})
    } else {
      res.json({success: false, error: "Invalid User ID."})
    }
  })
})

//UPDATE USER PROFILE
router.post("/profile/:user_id", function(req, res) {

  User.findById(req.params.user_id, function(err, user) {
    if (err) {
      res.json({success: false, error: err})
    } else if (!user) {
      res.json({success: false, error: "Invalid User ID"})
    } else {
      User.findByIdAndUpdate(req.params.user_id, {phone: req.body.phone, topics: req.body.topics}, function(err) {
        if (err) {
          res.json({success: false, error: err})
        } else {
          res.json({success: true})
        }
      })
    }
  })
})

router.get("/user/:user_id", function(req, res) {

  User.findById(req.params.user_id, function(err, user) {
    if (err) {
      res.json({success: false, error: err})
    } else if (user) {
      res.json({success: true, user: {firstName: user.firstName, lastName: user.lastName, phone: user.phone, topics: user.topics}})
    } else {
      res.json({success: false, error: "Invalid User ID."})
    }
  })
})


module.exports = router;
