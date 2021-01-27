/**
 * File format source:
 * https://developer.valvesoftware.com/wiki/Source_BSP_File_Format
 */

class BspTool extends Tool {

  constructor() {
    super({
      id: "bsp"
    });

    this.fileInput = this.addInput({
      label: "BSP File",
      type: "file",
      accept: ["bsp"]
    });

    this.fileInput.addEventListener("change", () => {
      this.read();
    });

    this.results = this.addTag("div", {
      classes: ["hidden"]
    });

    let foldMeta = this.addFold("Metadata", {
      parent: this.results
    });
    this.resultsMeta = this.addTag("pre", {
      parent: foldMeta
    });
    
    this.fileTable = this.addFold("Packed Files", {
      parent: this.results
    });

    this.buffer = null;
    this.bspData = null;
  }

  async read() {
    this.results.classList.add("hidden");
    this.fileTable.innerHTML = "";
    this.resultsMeta.innerHTML = "";

    this.hideError();
    this.showSpinner();

    try {
      this.buffer = await this.bufferFromFileInput(this.fileInput);

      let mapname = this.getFileFromFileInput(this.fileInput).name;
      mapname = mapname.substr(0, mapname.length - 4);

      this.bspData = bspScheme.read(this.buffer, 0);
      this.bspData.cubemaps = this.readCubemaps();
      this.bspData.textures = this.readTextures();
      this.bspData.entities = this.readEntities();
      
      this.fileTable.innerHTML = "";
      this.addDownloadableFile(mapname + ".zip", this.extractLumpBuffer(40), {
        title: "Download all as zip",
        parent: this.fileTable
      });

      let files = await this.readPakfile();

      let fileNum = 0;
      for (let k in files) {
        let file = files[k];
        this.addDownloadableFile(file.name, file._data.compressedContent, {
          parent: this.fileTable
        });
        fileNum++;
      }

      let txt = "";
      txt += "BSP version: " + this.bspData.version + "\n";
      txt += "Map revision: " + this.bspData.mapRevision + "\n";
      txt += "Number of entities: " + this.bspData.entities.length + "\n";
      txt += "Number of used textures: " + this.bspData.textures.length + "\n";
      txt += "Number of cubemaps: " + this.bspData.cubemaps.length + "\n";
      txt += "Number of packed files: " + fileNum;
      this.resultsMeta.innerText = txt;
      this.results.classList.remove("hidden");

      console.log(this.bspData);
    } catch (e) {
      this.showError("File is corrupted or not in BSP format!");
    } finally {
      this.hideSpinner();
    }
  }

  readCubemaps() {
    let data = this.extractLumpBuffer(42);
    let number = data.length / 16;
    let cubemaps = [];
    for (let offset = 0; offset < data.length; offset += 16) {
      cubemaps.push(sCubemap.read(data, offset));
    }
    return cubemaps;
  }

  readTextures() {
    const textureTableNames = this.extractLumpBuffer(43);
    return textureTableNames.toString("ASCII").split("\0");
  }

  readEntities() {
    let txt = this.extractLumpText(0);
    let lines = txt.split("\n");
    let currentEntity = null;
    let entities = [];

    let re = /"(.*?)"/g;
    for (let line of lines) {
      line = line.trim();
      if (line == "\0") break;

      if (line == "{") {
        currentEntity = {};
        continue;
      }
      if (line == "}") {
        entities.push(currentEntity);
        continue;
      }
      let vals = line.match(re);
      currentEntity[vals[0].replaceAll('"', "")] = vals[1].replaceAll('"', "");
    }
    return entities;
  }

  async readPakfile() {
    let data = this.extractLumpBuffer(40);
    let zip = new JSZip();
    let zipOut = await zip.loadAsync(data);
    return zipOut.files;
  }

  extractLumpBuffer(index) {
    let lump = this.bspData.lumps[index];
    return this.buffer.slice(lump.offset, lump.offset + lump.filelen);
  }

  extractLumpText(index) {
    let lump = this.bspData.lumps[index];
    return this.buffer.slice(lump.offset, lump.offset + lump.filelen).toString();
  }

}

const sCubemap = new Struct()
  .addMember(Struct.TYPES.INT, "X")
  .addMember(Struct.TYPES.INT, "Y")
  .addMember(Struct.TYPES.INT, "Z")
  .addMember(Struct.TYPES.INT, "Resolution")

const lump = new Struct()
  .addMember(Struct.TYPES.INT, "offset")
  .addMember(Struct.TYPES.INT, "filelen")
  .addMember(Struct.TYPES.INT, "version")
  .addMember(Struct.TYPES.CHAR, "identCode0")
  .addMember(Struct.TYPES.CHAR, "identCode1")
  .addMember(Struct.TYPES.CHAR, "identCode2")
  .addMember(Struct.TYPES.CHAR, "identCode3");

const bspScheme = new Struct()
  .addMember(Struct.TYPES.INT, "ident")
  .addMember(Struct.TYPES.INT, "version")
  .addMember(Struct.TYPES.SKIP(lump.SIZE * 64))
  .addMember(Struct.TYPES.INT, "mapRevision")
  .addArray(lump, "lumps", 8, 64, false)
  .addRule(Struct.RULES.EQUAL("ident", 0x50534256));

new BspTool();