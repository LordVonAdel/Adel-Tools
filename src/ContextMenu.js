export default class ContextMenu {

  constructor(element) {
    this.dom = document.createElement("div");
    this.dom.classList.add("context-menu");
    element.addEventListener("contextmenu", (e) => {
      let referencePosition = element.getClientRects()[0];

      this.show();

      e.preventDefault();
      this.dom.style.left = (e.clientX - referencePosition.left) + "px";
      this.dom.style.top = (e.clientY - referencePosition.top / 2) + "px";
    });
    element.appendChild(this.dom);

    this.closeListener = () => {
      this.hide();
    }
  }

  show() {
    document.body.addEventListener("mousedown", this.closeListener);
    this.dom.style.display = "block";
  }
  
  hide() {
    document.body.removeEventListener("mousedown", this.closeListener);
    this.dom.style.display = "none";
  }

  setItems(items, dom = null) {
    if (dom == null) {
      dom = this.dom;
    }

    dom.innerHTML = "";
    for (let item of items) {
      let subdiv = document.createElement("div");
      subdiv.innerText = item.text;
      dom.appendChild(subdiv);
      subdiv.classList.add("context-menu-item");

      if (item.click) {
        subdiv.addEventListener("click", item.click);
      }

      if (item.group) {
        subdiv.classList.add("context-menu-item-group");
        let subDom = document.createElement("div");
        subDom.classList.add("context-menu-submenu");
        subdiv.appendChild(subDom);

        this.setItems(item.items, subDom);
      }
    }
  }
}