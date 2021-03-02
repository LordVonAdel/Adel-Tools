/**
 * Works with 3 element arrays
 */
export default class Vector {

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

  static lengthSquared(v) {
    return v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
  }

  static crossProduct(a, b) {
    return [
      a[1]*b[2] - a[2]*b[1],
      a[2]*b[0] - a[0]*b[2],
      a[0]*b[1] - a[1]*b[0]
    ];
  }

  static subtract(a, b) {
    return [
      a[0] - b[0],
      a[1] - b[1],
      a[2] - b[2]
    ];
  }

  static add(a, b) {
    return [
      a[0] + b[0],
      a[1] + b[1],
      a[2] + b[2]
    ];
  }

  static scale(vector, factor) {
    return [
      vector[0] * factor,
      vector[1] * factor,
      vector[2] * factor
    ];
  }

  static clone(v) {
    return [...v];
  }

  static distanceBetween(vector1, vector2) {
    return Vector.length(Vector.subtract(vector2 - vector1));
  }

  static distanceBetweenSquared(vector1, vector2) {
    return Vector.lengthSquared(Vector.subtract(vector2, vector1));
  }

  static dot(v1, v2) {
    return v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  }

}
