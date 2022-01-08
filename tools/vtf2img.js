import VTF from "./../src/VTF.js";

class VTF2IMGTool extends Tool {

  constructor() {
    super({
      id: "vtf2img"
    });

    this.inputImage = this.addInput({
      type: "file",
      accept: ["vtf"],
      label: "VTF File"
    });
    this.inputImage.setAttribute("multiple", "0");
    this.inputImage.addEventListener("change", () => this.import());

    this.results = this.addTag("div");
    this.results.style.display = "none";

    let foldMeta = this.addFold("Metadata", {
      parent: this.results
    });
    this.resultsMeta = this.addTag("pre", {
      parent: foldMeta
    });
    this.canvas = this.addTag("canvas", {
      
    });
    this.canvasContext = this.canvas.getContext("2d");

    this.canvases = []; //seseeeseses
    this.fileDownloads = [];
  }

  async import() {
    if (!this.isFileInputFilled(this.inputImage)) return;
    this.showSpinner();

    for (let download of this.fileDownloads) {
      download.remove();
    }

    for (let canvas of this.canvases) {
      canvas.remove();
    }
    
    try {
      const buffer = await this.bufferFromFileInput(this.inputImage);
      const vtf = new VTF(VTF.Formats.none);
      const images = vtf.read(buffer);

      const inputFile = this.getFileFromFileInput(this.inputImage);
      const downloadName = inputFile.name.split(".")[0];

      for (let i = 0; i < images.length; i++) {
        let canvas = this.addTag("canvas", {
          style: {
            maxWidth: "100%",
          },
          parent: this.results
        });
        let context = canvas.getContext("2d");
        canvas.width = images[i].width;
        canvas.height = images[i].height;
        context.putImageData(images[i], 0, 0);
        this.canvases.push(canvas);

        this.fileDownloads.push(this.addDownloadableFile(downloadName + "_" + i + ".png", canvas.toDataURL(), {}));
      }

      this.results.style.display = "";
      this.resultsMeta.innerText = 
        `File version: ${vtf.version[0]}.${vtf.version[1]}\n`
       +`Width: ${vtf.width}\n`
       +`Height: ${vtf.height}\n`
       +`Frames: ${vtf.frames}\n`
       +`Mipmaps: ${vtf.mipmapCount}\n`
       +`Format: ${vtf.highResImageFormat.name}\n`
       +`Bumpmap scale: ${vtf.bumbmapScale}`;
    } catch (e) {
      this.showError(e);
    } finally {
      this.hideSpinner();
    }
  }

}

new VTF2IMGTool();
