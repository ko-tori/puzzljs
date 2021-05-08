const CUTTERS = {
  grid: () => require('./gridCutter'),
  random: () => require('./cutters/randomCutter')
};

class Puzzle {
  constructor(srcImg, params, cutter='random') {
    this.srcImg = srcImg;
    this.params = params;
    this.mapImg = CUTTERS[cutter]()(this.srcImg, params);
  }

  async init() {
    [this.mapImg, this.pieces] = await this.mapImg;
  }
}

if (require.main === module) {
  var Jimp = require('jimp');
  (async function() {
    let src = await Jimp.read('../data/imgs/test1.png');
    let w = 20;
    let p = new Puzzle(src, {
      width: w,
      height: Math.round(w / src.bitmap.width * src.bitmap.height)
    });

    await p.init();
    console.log(p.mapImg.bitmap);
    (await Jimp.read(p.mapImg)).write('../data/maps/test1.png');
  })();
}