/**
 * Behavior common to entities.
 *
 * An entity is an immutable object with properties in the REST representation
 * of our data, with helpers attached to it.  Entity classes commonly house
 * methods that probe an entity's properties, or convert them into other more
 * helpful representations for the application.
 */
export default class Model {

  constructor(properties:{}) {
    // React's `update()`  will call us without arguments when merging updates
    // to existing objects.  We can't freeze nor assign in that case.
    if (!properties) return;

    (<any>this.constructor).transformProperties(properties);
    Object.assign(this, properties);
    Object.freeze(this);
  }

  /**
   * Converts a plain object containing raw properties into an object of this
   * class.
   *
   * This *mutates* `rawData` (by setting its prototype)!
   */
  static toModel(rawData:{}):Model {
    if (Object.getPrototypeOf(rawData) === this.prototype) {
      // Make sure that copies created via `update()` are frozen.
      Object.freeze(rawData);
      return rawData;
    }

    this.transformProperties(rawData);
    Object.setPrototypeOf(rawData, this.prototype);
    Object.freeze(rawData);
    return rawData;
  }

  /**
   * A hook for transforming model properties before converting them into an
   * instance of the model (and freezing it).
   *
   * Note that this must MUTATE `properties` (in order to support `toModel`).
   */
  static transformProperties(_properties:{}):void {
    // abstract.
  }

}
