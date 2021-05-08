const mongoose = require('mongoose'),
  { Schema } = require('mongoose'),
  PuzzleState = require('./puzzlestate');

var roomSchema = new Schema({
  originalImage: Buffer,
  mapImage: Buffer,
  puzzleState: PuzzleState,
  users: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
});

module.exports = mongoose.model('Room', roomSchema);