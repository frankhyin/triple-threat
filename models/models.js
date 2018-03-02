import mongoose from 'mongoose';
import crypto from 'crypto';

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
  phone
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


export default {
  hashPassword: hashPassword,
  User: User,
  Activity: Activity
};