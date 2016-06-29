export default class Model {
  static toModel(data:{}):Model {
    if (data instanceof this) return data;
    // To combat the sheer volume of data that passes through this method, and
    // the fact that it is never modified in practice after being placed in the
    // store, we simply take over the existing data object rather than clone it.
    Object.setPrototypeOf(data, this.prototype);
    Object.freeze(data);

    return data;
  }
}
