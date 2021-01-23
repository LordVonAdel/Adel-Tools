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

    let input = document.createElement("input");
    input.id = inputId;
    input.type = options.type;
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
  }

  hideError() {
    this.errorPanel.classList.add("hidden");
  }

  addInfo(text) {
    this.addTag("div", {
      html: `<i class="fas fa-info-circle"></i> ` + text,
      classes: ["info"]
    })
  }

  bufferFromFileInput(input) {
    return new Promise(resolve => {
      const fileReader = new FileReader();
      fileReader.addEventListener("load", function() {
        resolve(Buffer.from(fileReader.result));
      });
      fileReader.readAsArrayBuffer(input.files[0]);
    });
  }

  static nextInputId = 0;

}

window.Tool = Tool;