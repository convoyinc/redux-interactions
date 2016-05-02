import * as _ from 'lodash';

// TODO: https://github.com/Microsoft/TypeScript/issues/4881
/**
 * Shorthand for calling `addInteractionReducer` on an `Interactions`.
 *
 * For example:
 *
 *   class Todos extends Interactions {
 *     initialState = []
 *
 *     @reducer
 *     add(state, text, completed = false) {
 *       return [...state, {text, completed}];
 *     }
 *   }
 *
 */
export default function reducer(target:any, key?:string, descriptor?:PropertyDescriptor):any {
  if (typeof target === 'string') {
    return _.partialRight(_applyReducer, target);
  }

  _applyReducer(target, key, descriptor);
}

function _applyReducer(target:any, name:string, descriptor:PropertyDescriptor, type?:string):void {
  if (typeof descriptor.value !== 'function') {
    throw new TypeError(`@reducer can only decorate methods`);
  }

  descriptor.value = target.constructor._registerInteractionReducer(name, descriptor.value, type);
}
