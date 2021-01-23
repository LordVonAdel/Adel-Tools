/**
 * File format:
 * https://developer.valvesoftware.com/wiki/Valve_Map_Format
 */

let nextVMFId = 2; // sides and solids with same id can exists

class VMFClass {

  constructor(classname) {
    this.classname = classname;
    this.properties = {};
    this.subclasses = [];
  }

  setProperty(name, value) {
    this.properties[name] = value;
  }

  addSubclass(vmfClass) {
    this.subclasses.push(vmfClass);
  }

  toText(indent = 0) {
    let pre = Array(indent+1).join("\t");

    let out = "";
    for (let property in this.properties) {
      out += pre + `"${property}" "${this.properties[property]}"\n`;
    }

    for (let cls of this.subclasses) {
      out += pre + cls.classname + "\n";
      out += pre + "{\n";
      out += cls.toText(indent + 1);
      out += pre + "}\n";
    }
    return out;
  }

}

class VMFSide extends VMFClass {

  constructor(plane, material) {
    super("side");

    let p1 = [plane[0], plane[1], plane[2]];
    let p2 = [plane[3], plane[4], plane[5]];
    let p3 = [plane[6], plane[7], plane[8]];

    let dir1 = Vector.subtract(p1, p2);
    let dir2 = Vector.subtract(p3, p2);
    let normal = Vector.normalize(Vector.crossProduct(dir1, dir2));

    this.u = Vector.normalize(dir1);
    this.v = Vector.normalize(dir2);

    this.setTexture(0, 0, 0.25);
    this.setProperty("id", nextVMFId++);
    this.setProperty("plane", `(${p1[0]} ${p1[1]} ${p1[2]}) (${p2[0]} ${p2[1]} ${p2[2]}) (${p3[0]} ${p3[1]} ${p3[2]})`);
    this.setProperty("material", material);
    this.setProperty("rotation", "0");
    this.setProperty("lightmapscale", "16");
    this.setProperty("smoothing_groups", "0");
  }

  setTexture(xoffset, yoffset, scale) {
    let u = this.u;
    let v = this.v;
    this.setProperty("uaxis", `[${u[0]} ${u[1]} ${u[2]} ${xoffset}] ${scale}`);
    this.setProperty("vaxis", `[${v[0]} ${v[1]} ${v[2]} ${yoffset}] ${scale}`);
  }

}

/**
 * Axis aligned solid
 */
class VMFSolid extends VMFClass {
  constructor(x1, y1, z1, x2, y2, z2, material = "TOOLS/TOOLSNODRAW") {
    super("solid");
    this.defaultMaterial = material;
    this.setProperty("id", nextVMFId++);

    this.sides = {
      top:    this.createSide([x1, y2, z2, x2, y2, z2, x2, y1, z2]),
      bottom: this.createSide([x1, y1, z1, x2, y1, z1, x2, y2, z1]),
      west:   this.createSide([x1, y2, z2, x1, y1, z2, x1, y1, z1]),
      east:   this.createSide([x2, y2, z1, x2, y1, z1, x2, y1, z2]),
      north:  this.createSide([x2, y2, z2, x1, y2, z2, x1, y2, z1]),
      south:  this.createSide([x2, y1, z1, x1, y1, z1, x1, y1, z2])
    }
    
  }

  createSide(plane) {
    let side = new VMFSide(plane, this.defaultMaterial);
    this.addSubclass(side);
    return side;
  }

  setMaterial(side, material) {
    this.sides[side].setProperty("material", material);
  }
}

class VMF extends VMFClass {

  constructor() {
    super("");

    this.versioninfo = new VMFClass("versioninfo");
    this.versioninfo.setProperty("editorversion", 0); 
    this.versioninfo.setProperty("editorbuild", 0);
    this.versioninfo.setProperty("mapversion", 1);
    this.versioninfo.setProperty("formatversion", 100);
    this.versioninfo.setProperty("prefab", 0);

    this.world = new VMFClass("world");
    this.world.setProperty("id", 1);
    this.world.setProperty("mapversion", 1);
    this.world.setProperty("classname", "worldspawn");
    this.world.setProperty("skyname", "sky_black_nofog");
    this.world.setProperty("maxpropscreenwidth", -1);
    this.world.setProperty("detailvbsp", "detail.vbsp");
    this.world.setProperty("detailmaterial", "detail/detailsprites");
    this.world.setProperty("maxblobcount", 250);

    this.cameras = new VMFClass("cameras");
    this.cameras.setProperty("activecamera", -1);

    this.cordons = new VMFClass("cordons");
    this.cordons.setProperty("active", 0);

    this.addSubclass(this.versioninfo);
    this.addSubclass(new VMFClass("visgroups"));
    this.addSubclass(this.world);
    this.addSubclass(this.cameras);
    this.addSubclass(this.cordons);

    this.nextSolidId = 0;
  }

  createSolid(x1, y1, z1, x2, y2, z2) {
    let solid = new VMFSolid(x1, y1, z1, x2, y2, z2);
    this.world.addSubclass(solid);
    return solid;
  }

}

window.VMF = VMF;
