/**
 * https://developer.valvesoftware.com/wiki/Valve_Texture_Format
 */

/**
 * Generate VTF 7.2 files
 */
export default class VTF {

  constructor(format) {
    this.resources = [];
    this.flags = format.flags;

    this.width = 0;
    this.height = 0;

    this.frames = 0; // Zero frames not allowed in export
    this.firstFrame = 0;

    this.highResImageFormat = format;
    this.lowResImageFormat = VTF.Formats.DXT1;
    this.mipmapCount = 0;

    this.lowResImageWidth = 16;
    this.lowResImageHeight = 16;
    this.lowResImageData = null;

    this.bumbmapScale = 1;
  }

  generateHeader() {
    //let headerSize = 0x50;
    let headerSize = 80;
    let buffer = Buffer.alloc(headerSize);

    // Signature
    buffer.writeUInt32LE(0x00465456, 0);

    // Version
    buffer.writeUInt32LE(7, 4);
    buffer.writeUInt32LE(2, 8);

    buffer.writeUInt32LE(headerSize, 12);
    buffer.writeUInt16LE(this.width, 16);
    buffer.writeUInt16LE(this.height, 18);
    buffer.writeUInt32LE(this.flags, 20);

    buffer.writeUInt16LE(this.frames, 24);
    buffer.writeUInt16LE(this.firstFrame, 26);

    // Padding
    buffer.writeInt32LE(0, 28);

    // Reflectivity
    buffer.writeFloatLE(1, 32);
    buffer.writeFloatLE(1, 36);
    buffer.writeFloatLE(1, 40);

    // Padding
    buffer.writeInt32LE(0, 44);

    buffer.writeFloatLE(this.bumbmapScale, 48);
    buffer.writeUInt32LE(this.highResImageFormat.value, 52);
    buffer.writeUInt8(this.mipmapCount, 56);

    // lowResImageFormat
    buffer.writeUInt32LE(this.lowResImageFormat.value, 57);

    // low res image size
    buffer.writeUInt8(this.lowResImageWidth, 61);
    buffer.writeUInt8(this.lowResImageHeight, 62);

    // depth
    buffer.writeUInt16LE(1, 63);

    return buffer;

    /* // Only 7.3+
    for (let resource of this.resources) {
      let offset = 0;
      buffer.writeUInt8(resource.tag[0]);
      buffer.writeUInt8(resource.tag[1]);
      buffer.writeUInt8(resource.tag[2]);
      buffer.writeUInt8(resource.flags);
      buffer.writeUInt32LE(offset);
    }
    */
  }

  generate() {
    let header = this.generateHeader();
    let resData = this.resources[0].data;
    return Buffer.concat([header, this.lowResImageData, resData]);
  }

  _isPowerOfTwo(x) {
    return ((x != 0) && !(x & (x - 1)));
  }

  getThumbnailSize(width, height) {
    //let exponent = Math.max(Math.log2(width)-4, Math.log2(height)-2);
    return 16;
  }

  createHighResResource(images) {

    if (images.length == 0) {
      throw new Error("A texture needs at least 1 frame.");
    }

    if (images.length > 0xFFFF) {
      throw new Error("Exceeding frame maximum of 65535.");
    }

    let i0 = images[0];
    let w = i0.width;
    let h = i0.height;

    if (images.some(c => c.width != w || c.height != h)) {
      throw new Error("Not all frames have the same size.");
    }

    if (w < 4 || h < 4) {
      throw new Error("Texture is too small. It needs a size of at least 4x4 pixels.");
    }

    if (w > 4096 || h > 4096) {
      throw new Error("Texture is too large.");
    }

    if (!this._isPowerOfTwo(w) || !this._isPowerOfTwo(h)) {
      throw new Error("Texture width or height is not a power of 2.");
    }

    this.width = w;
    this.height = h;
    this.frames = images.length;
    this.mipmapCount = Math.min(Math.log2(w) - 2, Math.log2(h) - 2);

    let canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    document.body.append(canvas);
    let ctx = canvas.getContext("2d");

    // Thumbnail
    let thumbnailSize = this.getThumbnailSize(w, h);
    this.lowResImageHeight = thumbnailSize;
    this.lowResImageWidth = thumbnailSize;

    ctx.drawImage(images[0], 0, 0, w, h, 0, 0, this.lowResImageWidth, this.lowResImageHeight);
    this.lowResImageData = this.lowResImageFormat.encode(ctx.getImageData(0, 0, this.lowResImageWidth, this.lowResImageHeight));

    // High res images
    let mipmaps = [];

    try {
      for (let i = this.mipmapCount; i >= 0; i--) {

        let mipWidth = w / (1 << i);
        let mipHeight = h / (1 << i);

        for (let j = 0; j < images.length; j++) {
          let img = images[j];
          ctx.clearRect(0, 0, mipWidth, mipHeight);
          ctx.drawImage(img, 0, 0, w, h, 0, 0, mipWidth, mipHeight);
          let pixelData = ctx.getImageData(0, 0, mipWidth, mipHeight);
          let converted = this.highResImageFormat.encode(pixelData);
          mipmaps.push(converted);
        }
      }
    } catch (e) {
      throw e;
    } finally {
      canvas.remove();
    }

    this.resources.push({
      tag: [0x30, 0, 0],
      flags: 0,
      data: Buffer.concat(mipmaps)
    });
  }
}

VTF.Flags = {
  PointSampling: 0x0001,
  TrilinearSampling: 0x0002,
  ClampS: 0x0004,
  ClampT: 0x0008,
  AnisotropicSampling: 0x0010,
  HintDXT5: 0x0020,
  PWLCorrected: 0x0040,
  NormalMap: 0x0080,
  NoMipmaps: 0x0100,
  NoLevelOfDetail: 0x0200,
  NoMinimumMipmap: 0x0400,
  Procedural: 0x0800,
  OneBitAlpha: 0x1000,
  EightBitAlpha: 0x2000,
  EnvironmentMap: 0x4000,
  RenderTarget: 0x8000,
  DepthRenderTarget: 0x10000,
  ClampU: 0x2000000,
  VertexTexture: 0x4000000,
  SSBump: 0x8000000,
  Border: 0x20000000
}

VTF.Formats = {
  RGB888: {
    value: 2,
    encode(imageData) {
      let pixels = imageData.data;
      let buffer = Buffer.alloc(pixels.length * (3 / 4));
      for (let i = 0; i < pixels.length / 4; i++) {
        buffer[i * 3] = pixels[i * 4];
        buffer[i * 3 + 1] = pixels[i * 4 + 1];
        buffer[i * 3 + 2] = pixels[i * 4 + 2];
      }
      return buffer;
    },
    flags: 0
  },
  RGBA8888: {
    value: 0,
    encode(imageData) {
      let pixels = imageData.data;
      return Buffer.from(pixels);
    },
    flags: VTF.Flags.EightBitAlpha
  },
  RGB565: {
    value: 4,
    encode(imageData) {
      let pixels = imageData.data;
      let buffer = Buffer.alloc(pixels.length / 2);
      for (let i = 0; i < pixels.length / 4; i++) {
        let r = pixels[i * 4];
        let g = pixels[i * 4 + 1];
        let b = pixels[i * 4 + 2];

        let r5 = ((r >> 3) & 0x1f);
        let g6 = ((g >> 2) & 0x3f);
        let b5 = ((b >> 3) & 0x1f);

        let col = (b5 << 11) | (g6 << 5) | (r5);
        buffer[i * 2] = (col >> 0) & 0xff;
        buffer[i * 2 + 1] = (col >> 8) & 0xff;
      }
      return buffer;
    },
    flags: 0
  },
  BGRA5551: {
    value: 21,
    encode(imageData) {
      let pixels = imageData.data;
      let buffer = Buffer.alloc(pixels.length / 2);
      for (let i = 0; i < pixels.length / 4; i++) {
        let r = pixels[i * 4];
        let g = pixels[i * 4 + 1];
        let b = pixels[i * 4 + 2];
        let a = pixels[i * 4 + 3];

        let r5 = ((r >> 3) & 0x1f);
        let g5 = ((g >> 3) & 0x1f);
        let b5 = ((b >> 3) & 0x1f);
        let a1 = (a > 128) & 1;

        let col = (r5 << 10) | (g5 << 5) | (b5 << 0) | (a1 << 15);
        buffer[i * 2] = (col >> 0) & 0xff;
        buffer[i * 2 + 1] = (col >> 8) & 0xff;
      }
      return buffer;
    },
    flags: VTF.Flags.OneBitAlpha
  },
  DXT1: {
    value: 13,
    encode(imageData) {
      return DXTN.compressDXT1(imageData.width, imageData.height, imageData.data);
    },
    flags: 0
  },
  DXT3: {
    value: 14,
    encode(imageData) {
      return DXTN.compressDXT3(imageData.width, imageData.height, imageData.data);
    },
    flags: 0
  },
  DXT5: {
    value: 15,
    encode(imageData) {
      return DXTN.compressDXT5(imageData.width, imageData.height, imageData.data);
    },
    flags: 0
  },
  none: {
    value: 0xFFFFFFFF,
    encode() {
      return Buffer.alloc(0);
    }
  }
}