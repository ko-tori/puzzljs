const mongoose = require('mongoose'),
  { Schema } = require('mongoose');

var puzzleStateSchema = new Schema({
  pieces: [{
    curX: Number,
    curY: Number,
    mapX: Number,
    mapY: Number,
    srcX: Number,
    srcY: Number,
    width: Number,
    height: Number
  }],
  srcImg: String,
  mapImg: String,
  params: Object
});

puzzleStateSchema.methods.toJSON = function() {
  return {
    pieces: [{
      curX: this.curX,
      curY: this.curY,
      mapX: this.mapX,
      mapY: this.mapY,
      srcX: this.srcX,
      srcY: this.srcY,
      width: this.width,
      height: this.height
    }],
    img: this.srcImg.split('/').slice(-1)[0],
    params: this.params
  };
};

module.exports = puzzleStateSchema;