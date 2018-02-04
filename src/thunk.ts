import * as _ from 'lodash';

// TODO: https://github.com/Microsoft/TypeScript/issues/4881
/**
 *
 * For example:
 *
 *   class Todos extends Interactions {
 *     initialState = []
 *
 *     @thunk
 *     fetchAndAdd({ text }, { dispatch }) {
 *       dispatch(this.add(text, false));
 *     }
 *
 *     @reducer
 *     add(state, text, completed = false) {
 *       return [...state, {text, completed}];
 *     }
 *   }
 *
 */
export default function thunk(_target:any, _key?:string, descriptor?:PropertyDescriptor):any {
  const originalFunction = descriptor.value;

  if (typeof originalFunction !== 'function') {
    throw new TypeError(`@thunk can only decorate methods`);
  }

  descriptor.value = function thunk(args:any):(dispatch:any, getState:any, context:any) => any {
    if (arguments.length > 1) {
      throw new TypeError(`@thunk can only decorate methods with one or zero arguments`);
    }
    return (dispatch, getState, context) => {
      return originalFunction.call(this, args, _.assign({}, context, {
        dispatch,
        getState,
      }));
    };
  };
}
