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

  getSubclassesByClassname(classname) {
    return this.subclasses.filter(cls => cls.classname == classname);
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

KVClass.parse = function(text) {
  let lines = text.trim().split("\n").map(l => l.trim()).filter(l => l.length > 0);
  let classname = lines.shift();
  lines.shift();
  let kv = new KVClass(classname);

  let subclassStack = [kv];

  for (let line of lines) {
    let inString = false;
    let values = [];
    let current = "";

    let trimmedLine = line.trim();
    for (let char of trimmedLine) {
      if (char == '"') {
        if (inString) {
          inString = false;
          values.push(current);
          current = "";
        } else {
          inString = true;
          current = "";
        }
        continue;
      }
      if (char == " " && !inString) {
        values.push(current);
        current = "";
        continue;
      }
      current += char;
    }
    values.push(current);

    let filtered = values.filter(v => v.trim().length > 0);

    if (filtered.length > 1) {
      let v1 = filtered.shift();
      let v2 = filtered.join(" ");
      subclassStack[0].setProperty(v1, v2);
      continue;
    }

    if (filtered[0] == "{") continue;
    if (filtered[0] == "}") {
      subclassStack.shift();
      continue;
    }

    let subclass = new KVClass(filtered[0]);
    subclassStack[0].addSubclass(subclass);
    subclassStack.unshift(subclass);
  }

  return kv;
}