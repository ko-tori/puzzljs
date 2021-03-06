const mongoose = require('mongoose'),
  { Schema } = require('mongoose'),
  passportLocalMongoose = require('passport-local-mongoose');

var userSchema = new Schema({
  username: String,
  stats: Object,
  rooms: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  }]
});

userSchema.plugin(passportLocalMongoose, {
  usernameField: 'username'
});

userSchema.methods.toJSON = function() {
  return {
    username: this.username,
    stats: this.stats
  };
};

module.exports = mongoose.model('User', userSchema);