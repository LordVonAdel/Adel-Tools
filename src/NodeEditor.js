import ContextMenu from "./ContextMenu.js";

export default class NodeEditor {

  constructor() {
    this.dom = document.createElement("div");
    this.dom.classList.add("node-editor");
    this.dom.style.width = "100%";
    this.dom.style.height = "512px";
    this.nodeTypes = [];

    this.contextMenu = new ContextMenu(this.dom);
  }

  registerNodes(nodes) {
    for (let typeName in nodes) {
      let type = new NodeType(typeName, nodes[typeName]);
      this.nodeTypes.push(type);
    }
  }

  spawnNode(typeName, x = 0, y = 0) {
    let type = this.nodeTypes.find(n => n.name == typeName);
    if (!type) throw new Error(`Node type ${typeName} does not exists!`);
    let node = new Node(type);
    this.dom.appendChild(node.dom);

    node.setPosition(x, y)
    return node;
  }

  updateContextMenu(groups) {
    let context = [];
    for (let group of groups) {
      context.push({
        text: group.name,
        group: true,
        items: group.items.map(item => ({
          text: item
        }))
      });
    }
    this.contextMenu.setItems(context);
  }

}

class NodeType {

  constructor(name, structure) {
    this.name = name;
    this.in = structure.in;
    this.out = structure.out;
  }

}

class Node {

  constructor(nodeType) {
    this.nodeType = nodeType;
    this.dom = document.createElement("div");
    this.dom.classList.add("node-editor-node");

    let title = document.createElement("div");
    title.classList.add("node-editor-node-title")
    title.innerText = this.nodeType.name;
    this.dom.appendChild(title);

    let body = document.createElement("div");
    body.classList.add("node-editor-node-body");
    this.dom.appendChild(body);

    let inputList = document.createElement("div");
    inputList.classList.add("node-editor-inputs");
    body.appendChild(inputList);

    let outputList = document.createElement("div");
    outputList.classList.add("node-editor-outputs");
    body.appendChild(outputList);

    for (let input of nodeType.in) {
      let div = document.createElement("div");
      div.innerText = input.name;
      inputList.appendChild(div);
    }

    for (let output of nodeType.out) {
      let div = document.createElement("div");
      div.innerText = output.name;
      outputList.appendChild(div);
    }
  }

  setPosition(x, y) {
    this.dom.style.left = x + "px";    
    this.dom.style.top = y + "px";
  }

}