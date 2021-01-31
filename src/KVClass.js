// Key-Value Class

export default class KVClass {

  constructor(classname) {
    this.classname = classname;
    this.properties = {};
    this.subclasses = [];
  }

  setProperty(name, value) {
    this.properties[name] = value;
  }

  setProperties(properties) {
    for (let property in properties) {
      this.setProperty(property, properties[property]);
    }
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