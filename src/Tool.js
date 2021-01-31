class Tool {

  constructor(options) {
    this.options = options;
    this.toolData = toolIndex[options.id];
    
    this.dom = document.getElementById("main");
    
    this.addTag("h2", {
      text: this.toolData.name
    });

    this.errorPanel = this.addTag("div", {
      classes: ["error", "hidden"]
    });

    this.fileDrops = {};

    document.body.ondrop = (e) => {
      e.preventDefault();

      for (let file of e.dataTransfer.files) {
        let extension = file.name.split(".").pop().toUpperCase();
        if (extension in this.fileDrops) {
          let uploadInput = this.fileDrops[extension] 
          uploadInput.type = "text";
          uploadInput.disabled = true;
          uploadInput.value = file.name;
          uploadInput._file = file;

          let changeEvent = new Event("change");
          uploadInput.dispatchEvent(changeEvent);
        }
      }
      
    }

    document.body.ondragover = (e) => {
      e.preventDefault();
    }
  }

  addInput(options) {
    let div = document.createElement("div");
    div.style.position = "relative";
    let inputId = "input-" + Tool.nextInputId;
    Tool.nextInputId++;

    let label = document.createElement("label");
    label.innerText = options.label;
    label.setAttribute("for", inputId);
    div.appendChild(label);

    let input = document.createElement(options.type == "select" ? "select" : "input");
    input.id = inputId;
    if (options.type != "select") {
      input.type = options.type;
    }
    div.appendChild(input);

    if ("append" in options) {
      let append = document.createElement("div");
      append.innerText = options.append;
      append.style.position = "absolute";
      append.style.bottom = "2px";
      append.style.right = "20px";
      div.appendChild(append);
    }

    if ("value" in options) {
      input.value = options.value;
    }

    if ("accept" in options) {
      input.setAttribute("accept", options.accept.map(ext => "." + ext).join(","));
      for (let extension of options.accept) {
        this.fileDrops[extension.toUpperCase()] = input;
      }
    }

    if ("options" in options) {
      for (let option of options.options) {
        this.addTag("option", {
          parent: input,
          text: option.text,
          attributes: {
            value: option.value
          }
        });
      }
    }

    this.dom.appendChild(div);
    return input;
  }

  addTag(tagname, options = {}) {
    let tag = document.createElement(tagname);

    if ("parent" in options) {
      options.parent.appendChild(tag);
    } else {
      this.dom.appendChild(tag);
    }

    if ("text" in options) {
      tag.innerText = options.text;
    }

    if ("html" in options) {
      tag.innerHTML = options.html;
    }

    if ("attributes" in options) {
      for (let attr in options.attributes) {
        tag.setAttribute(attr, options.attributes[attr]);
      }
    }

    if ("style" in options) {
      for (let style in options.style) {
        tag.style[style] = options.style[style];
      }
    }

    if ("classes" in options) {
      for (let cls of options.classes) {
        tag.classList.add(cls);
      }
    }

    if ("onclick" in options) {
      tag.addEventListener("click", options.onclick);
    }

    if ("onchange" in options) {
      tag.addEventListener("change", options.onchange);
    }

    return tag;
  }

  addFold(text, options = {}) {
    let title = this.addTag("h3", {text, ...options});
    let content = this.addTag("div", options);

    title.addEventListener("click", () => {
      content.classList.toggle("hidden");
    });

    return content;
  }

  addRadio(options) {
    let obj = {
      value: 0,
      onchange: options.onchange
    }

    if ("label" in options) {
      this.addTag("label", {
        ...options,
        text: options.label,
      });
    }

    let widget = this.addTag("div", {
      ...options,
      classes: ["radio"]
    });

    let items = [];
    for (let item of options.items) {
      let div = this.addTag("div", {
        parent: widget,
        classes: ["radio-item"]
      });
      div.dataset.value = item.value;

      div.addEventListener("click", () => {
        selectValue(item.value);
        if (obj.onchange)
          obj.onchange();
      });

      if (item.image) {
        this.addTag("img", {
          parent: div,
          attributes: {
            src: item.image
          }
        });
      }

      if (item.text) {
        this.addTag("div", {
          text: item.text,
          parent: div
        });
      }

      items.push(div);
    }

    function selectValue(value) {
      obj.value = value;
      for (let item of items) {
        item.classList.toggle("active", item.dataset.value == value)
      }
    }
    selectValue(options.value || items[0].value);

    return obj;
  }

  addMultiSelect(options) {
    let obj = {
      value: options.value,
      onchange: options.onchange
    }

    if ("label" in options) {
      this.addTag("label", {
        ...options,
        text: options.label,
      });
    }

    let widget = this.addTag("div", {
      ...options,
      classes: ["radio"]
    });

    let items = [];
    for (let item of options.items) {
      let div = this.addTag("div", {
        parent: widget,
        classes: ["radio-item"]
      });
      div.dataset.value = item.value;

      div.addEventListener("click", () => {
        if (obj.value.includes(item.value)) {
          let index = obj.value.indexOf(item.value);
          obj.value.splice(index, 1);
          div.classList.remove("active");
        } else {
          obj.value.push(item.value);
          div.classList.add("active");
        }
        if (obj.onchange)
          obj.onchange();
      });

      if (obj.value.includes(item.value)) {
        div.classList.add("active");
      }

      if (item.image) {
        this.addTag("img", {
          parent: div,
          attributes: {
            src: item.image
          }
        });
      }

      if (item.text) {
        this.addTag("div", {
          text: item.text,
          parent: div
        });
      }

      items.push(div);
    }

    return obj;
  }

  addDownloadableFile(name, data, options) {
    let div = this.addTag("div", {
      classes: ["file-download"],
      ...options
    });

    this.addTag("span", {
      text: options.title || name,
      parent: div
    });

    let downloadButton = this.addTag("div", {
      parent: div,
      classes: ["file-download-button"]
    });
    downloadButton.innerHTML = `<i class="fas fa-download"></i>`;
    
    div.addEventListener("click", () => {
      const url = URL.createObjectURL(new Blob([data], {
        type: options.mime || "application/octet-stream"
      }));
      
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", name);
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      setTimeout(() => URL.revokeObjectURL(url), 1000);
    });

    return div;
  }

  showSpinner() {
    document.getElementById("spinner").classList.remove("hidden");
  }

  hideSpinner() {
    document.getElementById("spinner").classList.add("hidden");
  }

  showError(message) {
    this.errorPanel.classList.remove("hidden");
    this.errorPanel.innerText = message;
    window.scrollTo(0, 0);
  }

  hideError() {
    this.errorPanel.classList.add("hidden");
  }

  addInfo(text) {
    this.addTag("div", {
      html: `<i class="fas fa-info-circle"></i>` + text,
      classes: ["info"]
    })
  }

  getFileFromFileInput(input) {
    if (input.type == "file") return input.files[0];
    if ("_file" in input) return input._file;
    return null;
  }

  getFilesFromFileInput(input) {
    if (input.type == "file") return input.files;
    if ("_files" in input) return input._files;
    return [];
  }

  isFileInputFilled(input) {
    return this.getFileFromFileInput(input) != null;
  }

  bufferFromFileInput(input) {
    return new Promise(resolve => {
      let file = this.getFileFromFileInput(input);
      const fileReader = new FileReader();
      fileReader.addEventListener("load", function() {
        resolve(new Buffer(fileReader.result));
      });
      fileReader.readAsArrayBuffer(file);
    });
  }

  imageFromFile(file) {
    return new Promise(resolveImage => {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", async () => {
        let result = fileReader.result;
        let img = new Image();
        
        await new Promise(resolve => {
          img.onload = resolve;
          img.src = result;
        });

        resolveImage(img);
      });
      fileReader.readAsDataURL(file);
    });
  }

  imageFromFileInput(input) {
    return new Promise(async resolve => {
      let file = this.getFileFromFileInput(input);
      return await this.imageFromFile(file);
    });
  }

  imagesFromFileInput(input) {
    let files = this.getFilesFromFileInput(input);
    return new Promise(async resolve => {
      let images = [];
      for (let file of files) {
        images.push(await this.imageFromFile(file));
      }
      resolve(images);
    });
  }

  static nextInputId = 0;

  static loadedScripts = [];

  static async loadScript(path) {
    return new Promise(resolve => {

      if (Tool.loadedScripts.includes(path)) return resolve();
      Tool.loadedScripts.push(path);

      let script = document.createElement("script");
      script.src = path;
      script.type = "module";
      document.head.appendChild(script);
      script.onload = function() {
        resolve();
      }
    });
  }

}

window.Tool = Tool;