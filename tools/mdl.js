class MdlTool extends Tool {

  constructor() {
    super({
      id: "mdl"
    });

    this.addInfo("You can drag files directly from the explorer or GCFScape anywhere into your browser window!")

    this.inputMDL = this.addInput({
      label: "MDL file",
      type: "file",
      accept: ["mdl"]
    });

    this.inputVVD = this.addInput({
      label: "VVD file",
      type: "file",
      accept: ["vvd"]
    });

    this.inputVTX = this.addInput({
      label: "VTX file",
      type: "file",
      accept: ["vtx"]
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

    this.preview = this.addTag("canvas", {
      parent: this.results,
      style: {
        width: "100%",
        height: "300px"
      }
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

    this.setupThree();
  }

  async loadModel() {
    this.hideError();
    this.results.classList.add("hidden");
    this.resultsMeta.innerText = "";
    this.converts.innerHTML = "";

    if (!this.isFileInputFilled(this.inputMDL)) {
      this.showError("Please select a MDL file!");
      return;
    }

    if (!this.isFileInputFilled(this.inputVTX)) {
      this.showError("Please select a VTX file!");
      return;
    }

    if (!this.isFileInputFilled(this.inputVVD)) {
      this.showError("Please select a VVD file!");
      return;
    }

    this.showSpinner();
    try {
      let modelName = this.getFileFromFileInput(this.inputMDL).name;
      modelName = modelName.substr(0, modelName.length - 4);

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
      let gltf = JSON.stringify(model.toGLTF());
      this.addDownloadableFile(modelName + ".gltf", gltf , {
        parent: this.converts,
        mime: "text/plain",
        title: "Convert to GLTF"
      });

      let obj = model.toObj();
      this.addDownloadableFile(modelName + ".obj", obj, {
        parent: this.converts,
        mime: "text/plain",
        title: "Convert to OBJ"
      });

      if (this.threeLoaded) {
        this.threeScene.remove(this.threeLoaded);
      }
      this.threeLoaded = this.objLoader.parse(obj).children[0];
      this.threeScene.add(this.threeLoaded);

      this.threeLoaded.rotation.x = -Math.PI / 2;
      this.threeLoaded.geometry.computeBoundingBox();
      let bbox = this.threeLoaded.geometry.boundingBox;
      this.threeCamera.position.copy(bbox.max);
      this.threeCamera.lookAt(this.threeLoaded.position);


    } catch (e) {
      console.error(e);
      this.showError("One or more files are corrupted or not the correct format!");
    } finally {
      this.hideSpinner();
    }
  }

  setupThree() {
    this.objLoader = new THREE.OBJLoader();
    this.threeLoaded = null;

    this.threeScene = new THREE.Scene();

    this.threeScene.add(new THREE.AmbientLight(0x808080));
    this.threeScene.add(new THREE.DirectionalLight(0xffffff, 0.5));

    const gridHelper = new THREE.GridHelper(10, 10);
    this.threeScene.add(gridHelper);

    this.threeCamera = new THREE.PerspectiveCamera(40, 1, 1, 5000);
    const renderer = new THREE.WebGLRenderer({ antialias:true, canvas: this.preview, alpha: true});
    renderer.setClearColor(0x000000, 0);

    const controls = new THREE.OrbitControls(this.threeCamera, renderer.domElement);
    this.threeCamera.position.set(0, 10, 10);

    const animate = () => {
      requestAnimationFrame(animate);

      const canvasRect = this.preview.getClientRects()[0];
      if (!canvasRect) return;

      renderer.setSize(canvasRect.width, canvasRect.height);
      this.threeCamera.aspect = canvasRect.width / canvasRect.height;
      this.threeCamera.updateProjectionMatrix();

      controls.update();
      renderer.render(this.threeScene, this.threeCamera);
    }
    animate();
    
  }

}

(async()=>{
  await Tool.loadScript("https://cdnjs.cloudflare.com/ajax/libs/three.js/r124/three.min.js");
  await Tool.loadScript("https://unpkg.com/three@0.85.0/examples/js/controls/OrbitControls.js");
  await Tool.loadScript("https://unpkg.com/three@0.85.0/examples/js/loaders/OBJLoader.js");
  new MdlTool();
})();
