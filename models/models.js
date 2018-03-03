var mongoose = require('mongoose');
var crypto = require('crypto');

var connect = process.env.MONGODB_URI;

mongoose.connect(connect);

var hashPassword = function(password) {
  var hash = crypto.createHash('md5');
  hash.update(password+"pingPING");
  return hash.digest('hex')
};

var userSchema = mongoose.Schema({
  email: {
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
  }
})

var activitySchema = mongoose.Schema({
  activityName: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  location: String,
  time: String,
  active: Boolean,

})

var User = mongoose.model('User', userSchema);
var Activity = mongoose.model('Activity', activitySchema);


module.exports = {
  hashPassword: hashPassword,
  User: User,
  Activity: Activity
};