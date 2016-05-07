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
  initialState:any;
  // Set on the prototype, not instances.
  _interactionReducers:{[key:string]:types.Reducer};

  constructor() {
    this.initialState = Object.create(null);

    // Register the class as a property of the instance so it is "exported"
    // under normal use.
    this[this.constructor.name] = this.constructor;

    // Auto-bind all methods declared on the subclass to this instance.
    for (const name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
      if (name === 'constructor') continue;
      if (typeof this[name] !== 'function') continue;
      this[name] = _bind(this, this[name]);
    }
    // As well as the public _instance_ API inherited from us.
    this.reducer = _bind(this, this.reducer);
  }

  /**
   * Delegates to each interaction reducer registered for this class.
   */
  reducer(state:any, action:types.Action):any {
    state = state === undefined ? this.initialState : state;
    if (!this._interactionReducers) return state;
    const interactionReducer = this._interactionReducers[action.type];
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

  static _registerInteractionReducer(name:string, reducer:types.InteractionReducer, type?:string):types.PassthroughActionCreator {
    if (!type) {
      type = uniqueType(`${this.prototype.constructor.name}:${name}`);
    }

    // Define a constant containing the complete action type as ALL_CAPS.
    this.prototype[_.snakeCase(name).toUpperCase()] = type;

    // Allow inheritance of interaction reducers.
    if (!Object.getOwnPropertyDescriptor(this.prototype, '_interactionReducers')) {
      this.prototype._interactionReducers = Object.create(this.prototype._interactionReducers || null);
    }

    // Register the interaction reducer.
    this.prototype._interactionReducers[type] = reducer;

    return function actionCreator(...args:any[]):types.PassthroughAction {
      return {type, args};
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
