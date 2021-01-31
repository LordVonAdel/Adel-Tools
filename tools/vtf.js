import VTF from "./../src/VTF.js";

class VTFTool extends Tool {

  constructor() {
    super({
      id: "vtf"
    });

    let formats = [];
    for (let format in VTF.Formats) {
      if (format == "none") continue;
      formats.push(format);
    }

    this.inputImage = this.addInput({
      type: "file",
      accept: ["png", "jpg", "jpeg"],
      label: "Source Images"
    });
    this.inputImage.setAttribute("multiple", "1");
    this.inputImage.addEventListener("change", () => this.import());

    this.inputFormat = this.addInput({
      label: "Texture Format",
      type: "select",
      options: formats.map(f => ({text: f, value: f}))
    });

    this.addTag("button", {
      text: "Convert",
      onclick: () => this.createVTF()
    });

    this.canvas = this.addTag("canvas", {
      style: {
        maxWidth: "100%",
        display: "none"
      }
    });

    this.fileDownload = null;
    this.images = [];
    this.exportName = "texture.vtf";
  }

  async import() {
    if (!this.isFileInputFilled(this.inputImage)) return;

    let firstFile = this.getFileFromFileInput(this.inputImage);
    this.exportName = firstFile.name.split(".")[0] + ".vtf";

    let images = await this.imagesFromFileInput(this.inputImage);
    let image = images[0];
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.canvas.style.display = "";

    let ctx = this.canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);

    this.images = images;
  }

  createVTF() {
    this.showSpinner();
    this.hideError();
    try {
      if (this.fileDownload) {
        this.fileDownload.remove();
      }

      let vtf = new VTF(VTF.Formats[this.inputFormat.value]);
      vtf.createHighResResource(this.images);
      let fileData = vtf.generate();
      this.fileDownload = this.addDownloadableFile(this.exportName, fileData, {});
    } catch (e) {
      this.showError(e.message);
    } finally {
      this.hideSpinner();
    }
  }

}

new VTFTool();
