/**
 * https://www.khronos.org/opengl/wiki/S3_Texture_Compression
 */
import Vector from "./Vector.js";

let DXT = {
  DXT1: {
    compress(width, height, pixels) {
      let w = Math.ceil(width / 4);
      let h = Math.ceil(height / 4);
      let blockNumber = w*h;
      let buffer = Buffer.alloc(blockNumber * 8);

      if (width < 4 || height < 4) return buffer;

      let index = 0;
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          
          let minColor = [0xff, 0xff, 0xff];
          let maxColor = [0, 0, 0];
          for (let ly = 0; ly < 4; ly++) {
            for (let lx = 0; lx < 4; lx++) {
              let pixelX = x + lx;
              let pixelY = y + ly;
              let pixelIndex = (pixelY * width + pixelX) * 4;
              let pixel = [pixels[pixelIndex], pixels[pixelIndex + 1], pixels[pixelIndex + 2]];
              if (Vector.lengthSquared(pixel) < Vector.lengthSquared(minColor)) {
                minColor = pixel;
              }
              if (Vector.lengthSquared(pixel) > Vector.lengthSquared(maxColor)) {
                maxColor = pixel;
              }
              /*minColor[0] = Math.min(minColor[0], pixels[pixelIndex]);
              minColor[1] = Math.min(minColor[1], pixels[pixelIndex+1]);
              minColor[2] = Math.min(minColor[2], pixels[pixelIndex+2]);
              maxColor[0] = Math.max(maxColor[0], pixels[pixelIndex]);
              maxColor[1] = Math.max(maxColor[1], pixels[pixelIndex+1]);
              maxColor[2] = Math.max(maxColor[2], pixels[pixelIndex+2]);*/
            }
          }
          let rMin = ((minColor[0] >> 3) & 0x1f);
          let gMin = ((minColor[1] >> 2) & 0x3f);
          let bMin = ((minColor[2] >> 3) & 0x1f);
          let c0 = (rMin << 11) | (gMin << 5) | (bMin << 0);
          //c0 = ((c0 >> 8) & 0x00FF) | ((c0 << 8) & 0xFF00);

          let rMax = ((maxColor[0] >> 3) & 0x1f);
          let gMax = ((maxColor[1] >> 2) & 0x3f);
          let bMax = ((maxColor[2] >> 3) & 0x1f);
          let c1 = (rMax << 11) | (gMax << 5) | (bMax << 0);
          //c1 = ((c1 >> 8) & 0x00FF) | ((c1 << 8) & 0xFF00);

          if (c0 < c1) {
            let tmp = c0;
            c0 = c1;
            c1 = tmp;

            tmp = maxColor;
            maxColor = minColor;
            minColor = tmp;
          }

          buffer[index] = (c0 >> 0) & 0xff;
          buffer[index + 1] = (c0 >> 8) & 0xff;
          index += 2;

          buffer[index] = (c1 >> 0) & 0xff;
          buffer[index + 1] = (c1 >> 8) & 0xff;
          index += 2;

          let possibleColors;
          if (c0 <= c1) {
            possibleColors = [
              minColor,
              maxColor,
              Vector.add(Vector.scale(minColor, 1/2), Vector.scale(maxColor, 1/2)),
              [-Infinity, -Infinity, -Infinity]
            ];
          } else {
            possibleColors = [
              minColor,
              maxColor,
              Vector.add(Vector.scale(minColor, 2/3), Vector.scale(maxColor, 1/3)),
              Vector.add(Vector.scale(minColor, 1/3), Vector.scale(maxColor, 2/3))
            ];
          }

          let lookup = [];
          for (let ly = 0; ly < 4; ly++) {
            for (let lx = 0; lx < 4; lx++) {
              let pixelX = x + lx;
              let pixelY = y + ly;
              let pixelIndex = (pixelY * width + pixelX) * 4;
              let pixel = [pixels[pixelIndex], pixels[pixelIndex + 1], pixels[pixelIndex + 2]];

              let minDistanceColor = possibleColors.reduce(
                (colorMin, color) => Vector.distanceBetweenSquared(color, pixel) < Vector.distanceBetweenSquared(color, colorMin) ? color : colorMin
              );
              lookup.push(possibleColors.indexOf(minDistanceColor));
            }
          }

          for (let i = 0; i < 16; i += 4) {
            buffer[index] = (lookup[i + 3] << 6) + (lookup[i + 2] << 4) + (lookup[i + 1] << 2) + lookup[i + 0];
            index ++;
          }

        }
      }

      return buffer;
    }
  }
}

export default DXT;