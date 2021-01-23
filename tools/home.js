class WallTool extends Tool {

  constructor() {
    super({
      id: "home",
      name: "Adel Tools"
    });

    this.addTag("p", {
      text: "Adel Tools is a collection of tools for Portal 2 mapping. Some of them will work with other source games too. All tools are usable in the browser and run locally. Files put in file inputs will not be uploaded, so all data stays on your machine."
    });

    this.addTag("p").innerHTML = "This page is hosted on GitHub. Check out the <a href='https://github.com/LordVonAdel/Adel-Tools'>repository</a>";

    this.addTag("h3", {text: "Inspectors"})
    this.addToolLink("bsp");
    this.addToolLink("mdl");
    
    this.addTag("h3", {text: "Generators"})
    this.addToolLink("wall");
  }

  addToolLink(toolId) {
    let toolData = window.toolIndex[toolId];

    let div = this.addTag("a", {
      classes: ["block-link"],
      attributes: {
        href: "?tool="+toolId
      }
    });

    this.addTag("div", {html: `<i class="${toolData.icon}"></i> ` + toolData.name, parent: div, style: {marginBottom: "0.5em"}});
    this.addTag("div", {text: toolData.description, parent: div});
  }

}

new WallTool();