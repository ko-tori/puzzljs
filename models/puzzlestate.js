const mongoose = require('mongoose'),
  { Schema } = require('mongoose');


var puzzleStateSchema = new Schema({
  pieces: [{
    srcLocation: {
      x: Number,
      y: Number
    },
    roomLocation: {
      x: Number,
      y: Number
    },
    width: Number,
    height: Number
  }],
  // widthPx: Number,
  // heightPx: Number,
  widthPieces: Number,
  heightPieces: Number
});

module.exports = mongoose.model('PuzzleState', puzzleStateSchema);