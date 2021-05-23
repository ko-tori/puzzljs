const mongoose = require('mongoose'),
  { Schema } = require('mongoose'),
  PuzzleState = require('./puzzlestate');

var roomSchema = new Schema({
  roomName: String,
  puzzleState: PuzzleState,
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

roomSchema.methods.toJSON = async function() {
  let r = await this.populate('users');
  return {
    roomName: r.roomName,
    puzzleState: r.puzzleState.toJSON(),
    users: r.users.map(u => u.toJSON())
  };
};

module.exports = mongoose.model('Room', roomSchema);