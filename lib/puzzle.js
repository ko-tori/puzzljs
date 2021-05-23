const Jimp = require('jimp');

const CUTTERS = {
  grid: () => require('./gridCutter'),
  random: () => require('./cutters/randomCutter')
};

class Puzzle {
  constructor(srcPath, destPath, params, cutter='random') {
    this.srcPath = srcPath;
    this.destPath = destPath;
    this.params = params;
    this.cutter = cutter;
  }

  async init() {
    this.srcImg = await Jimp.read(this.srcPath);
    this.mapImg = CUTTERS[this.cutter]()(this.srcImg, this.params);
    [this.mapImg, this.pieces] = await this.mapImg;

    this.mapImg.write(this.destPath);

    // shuffle pieces
    for (let i = this.pieces.length; i > 0; i--) {
      let j = Math.floor(Math.random() * i--);
      this.pieces[i].curX = this.pieces[j].mapX;
      this.pieces[i].curY = this.pieces[j].mapY;
      this.pieces[j].mapX = this.pieces[i].mapX;
      this.pieces[j].mapY = this.pieces[i].mapY;
    }
  }

  serialize() {
    return {
      pieces: this.pieces,
      params: this.params,
      srcImg: this.srcPath,
      mapImg: this.destPath,
      pieces: this.pieces
    };
  }
}

module.exports = Puzzle;