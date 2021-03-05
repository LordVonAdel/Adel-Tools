import ContextMenu from "./ContextMenu.js";

export default class NodeEditor {

  constructor() {
    this.dom = document.createElement("div");
    this.dom.classList.add("node-editor");
    this.dom.style.width = "100%";
    this.dom.style.height = "512px";
    this.nodeTypes = [];

    this.dragged = null;
    this.dragOffset = null;
    this.contextMenu = new ContextMenu(this.dom);

    document.body.addEventListener("mousemove", (e) => {
      let editorBox = this.dom.getClientRects()[0];

      if (this.dragged) {
        this.dragged.setPosition(
          e.clientX - this.dragOffset[0] - editorBox.x,
          e.clientY - this.dragOffset[1] - editorBox.y
        );
      }
    });

    document.body.addEventListener("mouseup", (e) => {
      this.dragged = null;
    });

  }

  registerNodes(nodes) {
    for (let typeName in nodes) {
      let type = new NodeType(typeName, nodes[typeName]);
      this.nodeTypes.push(type);
    }
  }

  spawnNode(typeName, x = 0, y = 0) {
    let type = this.nodeTypes.find(n => n.name.toLowerCase() == typeName.toLowerCase());
    if (!type) throw new Error(`Node type ${typeName} does not exists!`);
    let node = new Node(type);
    node.editor = this;
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

  focusNode(node) {
    this.dom.appendChild(node.dom);
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
    title.innerText = this.nodeType.alias || this.nodeType.name;
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

      let connectionPoint = document.createElement("div");
      div.appendChild(connectionPoint);
      connectionPoint.classList.add("node-connection-point");

      if ("type" in input) {
        let type = input.type;
        if ("color" in type) {
          connectionPoint.style.background = type.color;
        }
      }

      let nameText = document.createElement("span");
      div.appendChild(nameText);
      nameText.innerText = input.alias || input.name;
      inputList.appendChild(div);
    }

    for (let output of nodeType.out) {
      let div = document.createElement("div");

      let nameText = document.createElement("span");
      div.appendChild(nameText);
      nameText.innerText = output.alias || output.name;

      let connectionPoint = document.createElement("div");
      div.appendChild(connectionPoint);
      connectionPoint.classList.add("node-connection-point");

      if ("type" in output) {
        let type = output.type;
        if ("color" in type) {
          connectionPoint.style.background = type.color;
        }
      }

      outputList.appendChild(div);
    }

    this.editor = null;
    title.addEventListener("mousedown", (e) => {
      this.editor.focusNode(this);
      this.editor.dragged = this;
      let nodeBox = title.getClientRects()[0];
      
      this.editor.dragOffset = [
        e.clientX - nodeBox.x,
        e.clientY - nodeBox.y
      ];
    });
  }

  setPosition(x, y) {
    this.dom.style.left = x + "px";    
    this.dom.style.top = y + "px";
  }

}