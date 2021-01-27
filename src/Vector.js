/**
 * Works with 3 element arrays
 */

class Vector {

  static normalize(v) {
    let len = Vector.length(v);
    return [
      v[0] / len,
      v[1] / len,
      v[2] / len
    ]
  }

  static length(v) {
    return Math.sqrt(v[0]*v[0] + v[1]*v[1] + v[2]*v[2])
  }

  static crossProduct(a, b) {
    return [
      a[1]*b[2] - a[2]*b[1],
      a[2]*b[0] - a[0]*b[2],
      a[0]*b[1] - a[1]*b[0]
    ]
  }

  static subtract(a, b) {
    return [
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ]
  }

  static scale(vector, factor) {
    return [
      vector[0] * factor,
      vector[1] * factor,
      vector[2] * factor
    ]
  }

}

window.Vector = Vector;
