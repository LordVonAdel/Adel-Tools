class MdlTool extends Tool {

  constructor() {
    super({
      id: "mdl"
    });

    this.inputMDL = this.addInput({
      label: "MDL file",
      type: "file"
    });

    this.inputVVD = this.addInput({
      label: "VVD file",
      type: "file"
    });

    this.inputVTX = this.addInput({
      label: "VTX file",
      type: "file"
    });

    let button = this.addTag("button", {
      text: "Import"
    });

    button.addEventListener("click", () => {
      this.loadModel();
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

    let foldConvert = this.addFold("Convert", {
      parent: this.results
    });

    this.converts = this.addTag("div", {
      parent: foldConvert
    });
  }

  async loadModel() {
    this.hideError();
    this.results.classList.add("hidden");
    this.resultsMeta.innerText = "";
    this.converts.innerHTML = "";

    if (this.inputMDL.files.length == 0) {
      this.showError("Please select a MDL file!");
      return;
    }

    if (this.inputVTX.files.length == 0) {
      this.showError("Please select a VTX file!");
      return;
    }

    if (this.inputVVD.files.length == 0) {
      this.showError("Please select a VVD file!");
      return;
    }

    this.showSpinner();
    try {
      let model = new MDL();
      model.import({
        mdlData: await this.bufferFromFileInput(this.inputMDL), 
        vvdData: await this.bufferFromFileInput(this.inputVVD), 
        vtxData: await this.bufferFromFileInput(this.inputVTX)
      });

      let txt = "";
      txt += "Vertices: " + model.vertices.reduce((c, a) => c +a.length, 0) + "\n";
      txt += "Textures: " + model.textures.length + "\n";
      for (let texture of model.textures) {
        txt += "- " + texture + "\n";
      }
      txt += "Texture directories: " + model.textureDirs.length + "\n"
      for (let dir of model.textureDirs) {
        txt += "- " + dir + "\n";
      }
      this.resultsMeta.innerText = txt;

      this.results.classList.remove("hidden");
      this.addDownloadableFile("model.gltf", JSON.stringify(model.toGLTF()), {
        parent: this.converts,
        mime: "text/plain",
        title: "Convert to GLTF"
      });

      this.addDownloadableFile("model.obj", model.toObj(), {
        parent: this.converts,
        mime: "text/plain",
        title: "Convert to OBJ"
      });
    } catch (e) {
      console.error(e);
      this.showError("One or more files are corrupted or not the correct format!");
    } finally {
      this.hideSpinner();
    }
  }

}

new MdlTool();