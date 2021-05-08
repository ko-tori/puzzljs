const sharp = require('sharp');
const Jimp = require('jimp');

const funcGen = function() {
  let a = Math.random() * 10,
    b = Math.random() * 10,
    c = Math.random() * 10,
    d = Math.random() * 10;
  return x => (Math.sin(a * x + d) + Math.sin(b * x) + Math.sin(c * x)) / 20;
}

const bumpGen = function() {
  return x => 0;
}

async function randomCutter(srcImg, params) {
  let { width, height } = params;
  let img = await Jimp.read(srcImg);
  let imgWidth = img.bitmap.width;
  let imgHeight = img.bitmap.height;
  let pieceDims = [imgWidth / width, imgHeight / height];
  let pieces = [];

  let verticalCutFuncs = new Array(width - 1).fill(0).map(() => funcGen());
  verticalCutFuncs.unshift(() => 0);
  let verticalCuts = verticalCutFuncs.map(() => new Array(imgHeight));
  verticalCuts.push(new Array(imgHeight).fill(imgHeight + 1));
  let horizontalCutFuncs = new Array(height - 1).fill(0).map(() => funcGen());
  horizontalCutFuncs.unshift(() => 0);
  let horizontalCuts = horizontalCutFuncs.map(() => new Array(imgWidth));
  horizontalCuts.push(new Array(imgWidth).fill(imgWidth + 1));

  let offsetsX = new Array(width).fill(0);
  let offsetsY = new Array(height).fill(0);
  let maxX = new Array(width).fill(imgWidth);
  let minX = new Array(width).fill(0);
  let maxY = new Array(height).fill(imgHeight);
  let minY = new Array(height).fill(0);

  let curOffsetX = 0;
  for (let x = 0; x < width; x++) {
    let min = 0;
    let max = 0;
    for (let y = 0; y < imgHeight; y++) {
      let v = Math.floor(verticalCutFuncs[x](y / pieceDims[1]) * pieceDims[0]);
      verticalCuts[x][y] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }

    curOffsetX += max - min;
    if (x > 0) maxX[x - 1] = Math.floor(x * pieceDims[0] + max);
    minX[x] = Math.floor(x * pieceDims[0] + min);
    offsetsX[x] = curOffsetX;
  }

  let curOffsetY = 0;
  for (let y = 0; y < height; y++) {
    let min = 0;
    let max = 0;
    for (let x = 0; x < imgWidth; x++) {
      let v = Math.floor(horizontalCutFuncs[y](x / pieceDims[0]) * pieceDims[1]);
      horizontalCuts[y][x] = v;
      if (v < min) min = v;
      if (v > max) max = v;
    }

    curOffsetY += max - min;
    if (y > 0) maxY[y - 1] = Math.floor(y * pieceDims[1] + max);
    minY[y] = Math.floor(y * pieceDims[1] + min);
    offsetsY[y] = curOffsetY;
  }

  //console.log(minX, maxX, minY, maxY, offsetsX, offsetsY);
  //console.log(pieceDims);
  console.log(horizontalCuts.map(a => a.length));
  console.log(verticalCuts.map(a => a.length));
  // for (let i = 0; i < imgWidth; i++) {
  //   console.log(horizontalCuts[1](i / pieceDims[0]));
  // }

  let mapImg = await new Promise((resolve, reject) => {
    let w = imgWidth + curOffsetX;
    let h = imgHeight + curOffsetY;
    new Jimp(w, h, (err, image) => {
      if (err) reject(err)
      else resolve(image)
    });
  });

  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      console.log(`piece at (${x}, ${y}) with bounds ${[minX[x], maxX[x], minY[y], maxY[y]]}`)
      let pieceDim = [maxX[x] - minX[x], maxY[y] - minY[y]];
      img.scan(minX[x], minY[y], pieceDim[0], pieceDim[1], (px, py, idx) => {
        let localX = px - x * pieceDims[0];
        let localY = py - y * pieceDims[1];
        // if (x > 0 && y > 0) {
        //   console.log(localX, localY,
        //     verticalCuts[x][py],
        //     pieceDims[0] + verticalCuts[x + 1][py],
        //     horizontalCuts[y][px],
        //     pieceDims[1] + horizontalCuts[y + 1][px]);
        // }
        if (localX >= verticalCuts[x][py] &&
            localX < pieceDims[0] + verticalCuts[x + 1][py] &&
            localY >= horizontalCuts[y][px] &&
            localY < pieceDims[1] + horizontalCuts[y + 1][px]) {
          let mapidx = mapImg.getPixelIndex(px + offsetsX[x], py + offsetsY[y]);
          //console.log(`copying pixel ${idx}`);
          for (let c = 0; c < 4; c++) {
            mapImg.bitmap.data[mapidx + c] = img.bitmap.data[idx + c];
          }
        }
      });
    }
  }

  return [mapImg, pieces];
}

module.exports = randomCutter;