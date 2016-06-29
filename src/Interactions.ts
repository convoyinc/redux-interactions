import * as _ from 'lodash';
import * as uniqueType from 'unique-type';

import * as types from './types';

/**
 * A base class that reduces your boilerplate when following the interactions
 * pattern.
 *
 * https://github.com/convoyinc/redux-interactions
 */
export default class Interactions {
  mountPoint:string[];
  initialState:any = Object.create(null);
  // Set on the prototype, not instances.
  _interactionReducers:{[key:string]:types.Reducer};
  // This instance's reducers map, separate from _interactionReducer
  // so it can have a different type (or key in this map) than a base
  // class's reducer
  _instanceInteractionReducers:{[key:string]:types.Reducer} = Object.create(null);
  // Maintains a mapping from @reducer function name to unique action type
  _actionTypes:{[key:string]:string} = Object.create(null);

  constructor() {
    _autobind(this);

    // Register the class as a property of the instance so it is "exported"
    // under normal use.
    this[this.constructor.name] = this.constructor;

    // Add the class name to the action type, which we now know because it's
    // getting instantiated (vs a base class name)
    for (const key in this._interactionReducers) {
      // Make globally unique
      const type = this._actionTypes[key] = uniqueType(`${this.constructor.name}:${key}`);
      // Define a constant containing the complete action type as ALL_CAPS.
      this[_.snakeCase(key).toUpperCase()] = type;
      this._instanceInteractionReducers[type] = this._interactionReducers[key];
    }
  }

  /**
   * Delegates to each interaction reducer registered for this class.
   */
  reducer(state:any, action:types.Action):any {
    state = state === undefined ? this.initialState : state;
    if (!this._instanceInteractionReducers) return state;
    const interactionReducer = this._instanceInteractionReducers[action.type];
    if (!interactionReducer) return state;
    if (!Array.isArray((<types.PassthroughAction>action).args)) return state;
    return interactionReducer.call(this, state, ...(<types.PassthroughAction>action).args);
  }

  /**
   * Returns the interactions' scoped state given the entire state object.
   */
  scopedState(state:any):any {
    if (!this.mountPoint) {
      throw new Error(`${this.constructor.name} has not been mounted; can't get scoped state`);
    }
    return _.get(state, this.mountPoint);
  }

  /**
   * Registers an interaction reducer.
   *
   * You will probably find it more convenient to use the @reducer decorator.
   */
  static addInteractionReducer(name:string, reducer:types.InteractionReducer):void {
    // Register the reducer, and attach the action creator.
    this.prototype[name] = this._registerInteractionReducer(name, reducer);
  }

  static _registerInteractionReducer(name:string, reducer:types.InteractionReducer, type:string = name):types.PassthroughActionCreator {

    // Allow inheritance of interaction reducers.
    if (!Object.getOwnPropertyDescriptor(this.prototype, '_interactionReducers')) {
      this.prototype._interactionReducers = Object.create(this.prototype._interactionReducers || null);
    }

    // Register the interaction reducer.
    this.prototype._interactionReducers[type] = reducer;

    return function actionCreator(...args:any[]):types.PassthroughAction {
      return {type: this._actionTypes[type], args};
    };
  }

}

function _bind<T>(target:{}, method:T):T {
  const bound = (<any>method).bind(target);
  for (const name in method) {
    bound[name] = method[name];
  }
  return bound;
}

/**
 * Autobinds all functions present in `source` to `target`, and walks up the
 * prototype chain of `source`.
 */
function _autobind(target:{}):void {
  const names:{[key:string]:boolean} = {};
  _fillBindablePropertyNames(target, names);

  for (const key of _.keys(names)) {
    target[key] = _bind(target, target[key]);
  }
}

function _fillBindablePropertyNames(target:{}, names:{[key:string]:boolean}):void {
  for (const key of Object.getOwnPropertyNames(target)) {
    if (key === 'constructor') continue;
    if (!_.isFunction(target[key])) continue;
    names[key] = true;
  }
  const nextTarget = Object.getPrototypeOf(target);
  if (nextTarget !== Object.prototype) {
    _fillBindablePropertyNames(nextTarget, names);
  }
}
