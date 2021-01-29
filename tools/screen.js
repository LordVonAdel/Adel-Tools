/**
 * WIP
 */

class ScreenTool extends Tool {

  constructor() {
    super({
      id: "screen"
    });

    this.addInput({
      label: "Screen width",
      type: "number",
      value: 512
    });

    this.addInput({
      label: "Screen height",
      type: "number",
      value: 256
    });

    this.addInput({
      label: "Custom cursor material",
      type: "file"
    });
  }

}

new ScreenTool();