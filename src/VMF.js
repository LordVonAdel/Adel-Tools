/**
 * File format:
 * https://developer.valvesoftware.com/wiki/Valve_Map_Format
 */

import Vector from "./Vector.js";
import KVClass from "./KVClass.js";

let nextEntityId = 2;
let nextSideId = 2;

class VMFSide extends KVClass {

  constructor(plane, material) {
    super("side");

    let p1 = [plane[0], plane[1], plane[2]];
    let p2 = [plane[3], plane[4], plane[5]];
    let p3 = [plane[6], plane[7], plane[8]];

    let dir1 = Vector.subtract(p1, p2);
    let dir2 = Vector.subtract(p3, p2);
    this.normal = Vector.normalize(Vector.crossProduct(dir1, dir2));

    this.u = Vector.normalize(dir1);
    this.v = Vector.scale(Vector.normalize(dir2), -1);

    this.xoffset = 0;
    this.yoffset = 0;
    this.scale = 0;

    this.setTexture(0, 0, 0.25);
    this.setProperty("id", nextSideId++);
    this.setProperty("plane", `(${p1[0]} ${p1[1]} ${p1[2]}) (${p2[0]} ${p2[1]} ${p2[2]}) (${p3[0]} ${p3[1]} ${p3[2]})`);
    this.setProperty("material", material);
    this.setProperty("rotation", "0");
    this.setProperty("lightmapscale", "16");
    this.setProperty("smoothing_groups", "0");
  }

  setTexture(xoffset, yoffset, scale) {
    this.xoffset = xoffset;
    this.yoffset = yoffset;
    this.scale = scale;
    this.updateAxis();
  }

  updateAxis() {
    this.setProperty("uaxis", `[${this.u[0]} ${this.u[1]} ${this.u[2]} ${this.xoffset}] ${this.scale}`);
    this.setProperty("vaxis", `[${this.v[0]} ${this.v[1]} ${this.v[2]} ${this.yoffset}] ${this.scale}`);
  }

  invertUV() {
    this.u = Vector.scale(this.u, -1);
    this.v = Vector.scale(this.v, -1);
    this.updateAxis();
  }

}

/**
 * Axis aligned solid
 */
class VMFSolid extends KVClass {
  constructor(x1, y1, z1, x2, y2, z2, material = "TOOLS/TOOLSNODRAW") {
    super("solid");
    this.defaultMaterial = material;
    this.setProperty("id", nextEntityId++);

    this.sides = {
      top:    this.createSide([x1, y2, z2, x2, y2, z2, x2, y1, z2]),
      bottom: this.createSide([x1, y1, z1, x2, y1, z1, x2, y2, z1]),
      west:   this.createSide([x1, y2, z2, x1, y1, z2, x1, y1, z1]),
      east:   this.createSide([x2, y2, z1, x2, y1, z1, x2, y1, z2]),
      north:  this.createSide([x2, y2, z2, x1, y2, z2, x1, y2, z1]), // +Y because it is hammer viewport top(x/y) up
      south:  this.createSide([x2, y1, z1, x1, y1, z1, x1, y1, z2])
    }

    this.sides.north.invertUV();
    
  }

  createSide(plane) {
    let side = new VMFSide(plane, this.defaultMaterial);
    this.addSubclass(side);
    return side;
  }

  setMaterial(side, material) {
    this.sides[side].setProperty("material", material);
  }

  setMaterialFull(material) {
    for (let side in this.sides) {
      this.sides[side].setProperty("material", material);
    }
  }
}

class VMFEntity extends KVClass {

  constructor(classname) {
    super("entity");
    this.setProperty("classname", classname)
    this.setProperty("id", nextEntityId++);
  }

}

export default class VMF extends KVClass {

  constructor() {
    super("");

    this.versioninfo = new KVClass("versioninfo");
    this.versioninfo.setProperty("editorversion", 0); 
    this.versioninfo.setProperty("editorbuild", 0);
    this.versioninfo.setProperty("mapversion", 1);
    this.versioninfo.setProperty("formatversion", 100);
    this.versioninfo.setProperty("prefab", 0);

    this.world = new KVClass("world");
    this.world.setProperty("id", 1);
    this.world.setProperty("mapversion", 1);
    this.world.setProperty("classname", "worldspawn");
    this.world.setProperty("skyname", "sky_black_nofog");
    this.world.setProperty("maxpropscreenwidth", -1);
    this.world.setProperty("detailvbsp", "detail.vbsp");
    this.world.setProperty("detailmaterial", "detail/detailsprites");
    this.world.setProperty("maxblobcount", 250);

    this.cameras = new KVClass("cameras");
    this.cameras.setProperty("activecamera", -1);

    this.cordons = new KVClass("cordons");
    this.cordons.setProperty("active", 0);

    this.addSubclass(this.versioninfo);
    this.addSubclass(new KVClass("visgroups"));
    this.addSubclass(this.world);
    this.addSubclass(this.cameras);
    this.addSubclass(this.cordons);
  }

  createSolid(x1, y1, z1, x2, y2, z2) {
    let solid = new VMFSolid(x1, y1, z1, x2, y2, z2);
    this.world.addSubclass(solid);
    return solid;
  }

  createEntity(classname, properties = {}) {
    let entity = new VMFEntity(classname);
    entity.setProperties(properties);

    this.addSubclass(entity);
    return entity;
  }

  createFuncDetail(x1, y1, z1, x2, y2, z2) {
    let funcDetail = this.createEntity("func_detail", {});
    let solid = new VMFSolid(x1, y1, z1, x2, y2, z2);
    funcDetail.addSubclass(solid);
    funcDetail.solid = solid;
    return funcDetail;
  }

}

