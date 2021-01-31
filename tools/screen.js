/**
 * WIP
 */

import VMF from "./../src/VMF.js";

class ScreenTool extends Tool {

  constructor() {
    super({
      id: "screen"
    });

    this.inputW = this.addInput({
      label: "Screen width",
      type: "number",
      value: 64,
      onchange: () => this.updateWorkspace(),
      append: "Hammer Units"
    });

    this.inputH = this.addInput({
      label: "Screen height",
      type: "number",
      value: 32,
      onchange: () => this.updateWorkspace(),
      append: "Hammer Units"
    });

    this.workspace = this.addTag("div", {
      style: {
        width: "100%",
        height: "100px",
        border: "1px solid white",
        marginBottom: "1em"
      }
    });

    this.addTag("button", {
      text: "Generate",
      onclick: () => this.generate()
    })

    this.download = null;
  }

  updateWorkspace() {
    let w = this.inputW.value;
    let h = this.inputH.value;
    let ratio = w / h;
    let divRect = this.workspace.getClientRects()[0];
    this.workspace.style.height = divRect.width * ratio;
  }

  generate() {
    this.showSpinner();
    this.hideError();

    try {
      if (this.download) {
        this.download.remove();
      }

      let w = this.inputW.value;
      let h = this.inputH.value;

      if (w < 0) {
        throw new Error("Screen width is negative!");
      }

      if (h < 0) {
        throw new Error("Screen height is negative!");
      }

      let screenId = Date.now().toString(36);

      let vmf = new VMF();
      let mainDetail = vmf.createFuncDetail(-w, -8, -h, 0, 0, 0);
      mainDetail.solid.setMaterialFull("plastic/plasticwall001b");
      mainDetail.solid.setMaterial("north", "vgui/screens/screen");
      let overlayDetail = vmf.createFuncDetail(-w, 0, -h, 0, 1, 0);
      overlayDetail.solid.setMaterial("north", "interactive_screens/screen_overlay");

      vmf.createEntity("func_instance_io_proxy", {
        origin: "0 0 0",
        targetname: "proxy"
      });

      vmf.createEntity("info_target", {
        origin: "0 0 0",
        targetname: "screen_reference",
        angles: "90 270 0",
      });

      vmf.createEntity("info_target", {
        origin: -w + " 0 0",
        targetname: "screen_axisU",
        angles: "0 180 -90"
      });

      vmf.createEntity("logic_script", {
        vscripts: "screen/interactable_screen.nut",
        thinkfunction: "Think",
        name: "screen_script",
        origin: "0 0 -16",
        group00: "screen_cursor",
        group01: "screen_eye_direction",
        group02: "screen_reference",
        group03: "screen_axisU"
      });

      vmf.createEntity("env_sprite", {
        targetname: "screen_cursor",
        model: "sprites/hud/v_crosshair1.vmt",
        glowproxysize: "0.02",
        scale: "0.1",
        spawnflags: "1",
        rendermode: "9",
        origin: "-24 0 -24"
      });

      vmf.createEntity("logic_measure_movement", {
        measurereference: "screen_reference",
        measuretarget: "!player",
        measuretype: "1",
        target: "screen_eye_direction",
        targetreference: "screen_reference",
        origin: "-16 0 0"
      });

      vmf.createEntity("info_target", {
        origin: "-32 0 0",
        targetname: "screen_eye_direction"
      });


      this.download = this.addDownloadableFile("screen.vmf", vmf.toText(), {
        title: "Download VMF"
      });

    } catch (e) {
      this.showError(e.message);
    } finally {
      this.hideSpinner();
    }
  }

}

new ScreenTool();
