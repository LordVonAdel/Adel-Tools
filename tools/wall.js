const WallStyles = {
  black_clean: {
    32: "METAL/BLACK_WALL_METAL_002B",
    64: "METAL/BLACK_WALL_METAL_002A",
    128: "METAL/BLACK_WALL_METAL_002C",
    256: "METAL/BLACK_WALL_METAL_002D"
  },
  black_clean2: {
    32: "METAL/BLACK_WALL_METAL_004B",
    64: "METAL/BLACK_WALL_METAL_004A",
    128: "METAL/BLACK_WALL_METAL_004C",
    256: "METAL/BLACK_WALL_METAL_004D"
  },
  black_dirty: {
    32: "METAL/BLACK_WALL_METAL_005B",
    64: "METAL/BLACK_WALL_METAL_005A",
    128: "METAL/BLACK_WALL_METAL_005C",
    256: "METAL/BLACK_WALL_METAL_005D"
  },
  black_top: {
    32: "METAL/BLACK_WALL_METAL_004B_TOP",
    64: "METAL/BLACK_WALL_METAL_004A_TOP",
    128: "METAL/BLACK_WALL_METAL_004C_TOP",
    256: "METAL/BLACK_WALL_METAL_004C_TOP"
  },
  white_clean: {
    32: "TILE/WHITE_WALL_TILE003F",
    64: "TILE/WHITE_WALL_STATE",
    128: "TILE/WHITE_WALL_TILE003H",
    256: "TILE/WHITE_WALL_TILE003H"
  },
  white_dirty: {
    32: "TILE/WHITE_WALL_TILE004H",
    64: "TILE/WHITE_WALL_TILE004H",
    128: "TILE/WHITE_WALL_TILE004G",
    256: "TILE/WHITE_WALL_TILE004G"
  }
}

class WallTool extends Tool {

  constructor() {
    super({
      id: "wall"
    });

    this.inputWidth = this.addInput({
      label: "Width",
      type: "number",
      append: "Hammer Units",
      value: 512
    });
    this.inputWidth.addEventListener("change", () => this.generate());

    this.inputHeight = this.addInput({
      label: "Height",
      type: "number",
      append: "Hammer Units",
      value: 256
    });
    this.inputHeight.addEventListener("change", () => this.generate());

    this.inputTextures = this.addRadio({
      label: "Textures",
      items: [
        {value: "black_clean", text: "Black Clean", image: "./img/wall_types/black_clean.jpg"},
        {value: "black_clean2", text: "Black Clean Dark", image: "./img/wall_types/black_darker_clean.jpg"},
        {value: "black_dirty", text: "Black Dirty", image: "./img/wall_types/black_dirty.jpg"},
        {value: "black_top", text: "Black Top", image: "./img/wall_types/black_top.jpg"},
        {value: "white_clean", text: "White Clean", image: "./img/wall_types/white_clean.jpg"},
        {value: "white_dirty", text: "White Dirty", image: "./img/wall_types/white_dirty.jpg"}
      ],
      value: "black_clean",
      onchange: () => this.generate()
    });

    this.inputSizes = this.addMultiSelect({
      label: "Tile Sizes",
      items: [
        {value: 32, text: "32 x 32"},
        {value: 64, text: "64 x 64"},
        {value: 128, text: "128 x 128"},
        {value: 256, text: "256 x 256"}
      ],
      value: [32, 64, 128, 256],
      onchange: () => this.generate()
    });

    this.canvas = this.addTag("canvas", {
      style: {
        background: "white",
        margin: "auto"
      }
    });

    this.inputThick = this.addInput({
      label: "Wall thickness",
      type: "number",
      append: "Hammer Units",
      value: 32
    });
    this.inputThick.addEventListener("change", () => this.generate());

    this.addInfo("The generated vmf file has some texture alignment issues! (Maybe I will fix it in the future)");

    this.download = null;

    this.generate();
  }

  generate() {
    this.hideError();
    let w = this.inputWidth.value;
    let h = this.inputHeight.value;
    let t = this.inputThick.value;
    let smallestUnit = this.inputSizes.value.reduce((acc, cur) => Math.min(acc, cur), Infinity);
    let smallestCell = smallestUnit / 32;

    if (this.inputSizes.value.length == 0) {
      this.showError("Select at least one tile size!");
      return;
    }

    if (w < 0) {
      this.showError("Please give a positive width!");
      return;
    }
    if (h < 0) {
      this.showError("Please give a positive height!");
      return;
    }
    if (t < 0) {
      this.showError("Please give a positive wall thickness!");
      return;
    }

    if (w % smallestUnit != 0) {
      this.showError("Width is not divisible by " + smallestUnit + "!");
      return;
    }
    if (h % smallestUnit != 0) {
      this.showError("Height is not divisible by " + smallestUnit + "!");
      return;
    }

    let gridWidth = w / smallestUnit;
    let gridHeight = h / smallestUnit;
    let gridArea = gridWidth * gridHeight;
    let grid = [];

    for (let y = 0; y < gridHeight; y++) {
      grid[y] = [];
      for (let x = 0; x < gridWidth; x++) {
        grid[y][x] = smallestUnit;
      }
    }

    let sizes = this.inputSizes.value.sort();
    for (let size of sizes) {
      let units = size / smallestUnit;
      let tries = gridArea / (units*units) * 3;
      for (let i = 0; i < tries; i++) {
        let x = Math.floor((Math.random() * ((gridWidth+1) - units)) / smallestCell) * smallestCell;
        let y = Math.floor((Math.random() * ((gridHeight+1) - units)) / smallestCell) * smallestCell;
        let cw = size / smallestUnit;
        let ch = size / smallestUnit;

        if (x < 0 || y < 0) continue;

        let isFree = true;
        for (let checkY = y; checkY < y + ch; checkY++) {
          for (let checkX = x; checkX < x + cw; checkX++) {
            if (grid[checkY][checkX] != smallestUnit) {
              isFree = false;
            }
          }
        }
        if (!isFree) continue;

        for (let checkY = y; checkY < y + ch; checkY++) {
          for (let checkX = x; checkX < x + cw; checkX++) {
            grid[checkY][checkX] = -1;
          }
        }
        grid[y][x] = size;
      }
    }

    // --- Preview ---
    this.canvas.width = w;
    this.canvas.height = h;
    let ctx = this.canvas.getContext("2d");

    for (let y = 0; y < gridHeight; y++) {
      for (let x = 0; x < gridWidth; x++) {
        let cell = grid[y][x];
        if (cell == -1) continue;
        ctx.strokeRect(x * 32, y * 32, cell, cell);
      }
    }

    // --- VMF ---
    let style = WallStyles[this.inputTextures.value];
    let vmf = new VMF();

    let y = t;
    for (let z = 0; z < gridHeight; z++) {
      for (let x = 0; x < gridWidth; x++) {
        let cell = grid[z][x];
        let h = z * smallestUnit;
        if (cell == -1) continue;

        let solid = vmf.createSolid(x * smallestUnit, 0, h, x * smallestUnit + cell, y, h + cell);
        solid.setMaterial("south", style[cell]);

        let u = (Math.round(-x*smallestUnit*4 / cell) * cell);
        let v = (Math.round((y+cell)*smallestUnit*4 / cell) * cell);
        solid.sides["south"].setTexture(u, v, 0.25);
      }
    }

    if (this.download) {
      this.download.remove();
    }

    this.download = this.addDownloadableFile("wall.vmf", vmf.toText(), {
      title: "Create VMF"
    });
  }

}

new WallTool();