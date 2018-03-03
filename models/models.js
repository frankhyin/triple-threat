var mongoose = require('mongoose');
var crypto = require('crypto');

var connect = process.env.MONGODB_URI;

mongoose.connect(connect);

var defaultTopics = ["sports", 'exercise', 'food', 'drinks', 'movies', 'concerts', 'hackathon', 'other events' ]

var hashPassword = function(password) {
  var hash = crypto.createHash('md5');
  hash.update(password+"pingPING");
  return hash.digest('hex')
};

var userSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    minlength: 10,
    maxlength: 10,
    required: true,
  },
  topics: {
    type: Array,
    default: defaultTopics
  }
})

var pingSchema = mongoose.Schema({
  pingContent: {
    type: String,
    required: true
  },
  location: Array,
  begin: Date,
  end: Date,
  active: {
    type: Boolean,
    default: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

// var messageSchema = mongoose.Schema({
//   // ping: {
//   //   type: mongoose.Schema.Types.ObjectId,
//   //   ref: 'Ping'
//   // },
//   owner: String,
//   owner_id: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'User'
//   },
//   createdAt: Date,
//   text: String,
// })

var User = mongoose.model('User', userSchema);
var Ping = mongoose.model('Ping', pingSchema);
// var Message = mongoose.model('Message', messageSchema);


module.exports = {
  hashPassword: hashPassword,
  User: User,
  Ping: Ping,
  //Message: Message
};