/**
 * https://www.khronos.org/opengl/wiki/S3_Texture_Compression
 * WIP
 */

DXT = {
  DXT1: {
    compress(width, height, pixels) {
      let w = Math.ceil(width / 4);
      let h = Math.ceil(height / 4);
      let blockNumber = w*h;
      let buffer = Buffer.alloc(blockNumber * 16);

      return buffer;
    }
  }
}