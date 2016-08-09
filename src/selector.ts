import * as _ from 'lodash';

type Selector = (state:Object, ...args:any[]) => any;

// TODO: https://github.com/Microsoft/TypeScript/issues/4881
/**
 * Shorthand for a selector that scopes down to the mount point of interactions.
 *
 * For example:
 *
 *   class Todos extends Interactions {
 *     initialState = [];
 *
 *     mountPoint = ['entities', 'todos'];
 *
 *     @selector
 *     getFirst(scopedState) {
 *       return scopedState[0];  // Returns storeState.entities.todos[0]
 *     }
 *   }
 *
 */
export default function selector(_target:Object, _key?:string, descriptor?:PropertyDescriptor):any {
  if (typeof descriptor.value !== 'function') {
    throw new TypeError(`@selector can only decorate methods`);
  }

  descriptor.value = _makeSelector(descriptor.value);
}

function _makeSelector(scopedSelector:(scopedState:Object, ...args:any[]) => any):Selector {
  return function interactionsSelector(state:Object, ...args:any[]):Selector {
    if (!_.has(state, this.mountPoint)) {
      throw new TypeError(
        `Called @selector with invalid state object (no path '${this.mountPoint}'). ` +
        `Perhaps a @selector method is calling another @selector method? Or the ` +
        `interaction isn't mounted at all.`
      );
    }
    return scopedSelector.call(this, _.get(state, this.mountPoint), ...args);
  };
}
