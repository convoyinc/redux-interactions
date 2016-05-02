import * as _ from 'lodash';
import * as deepUpdate from 'deep-update';

import Interactions from './Interactions';
import * as types from './types';

export type MountSpec = {[key:string]:MountSpec | Interactions};

type _MountPath = [string[], Interactions];

/**
 * Combines a collection of interactions into a single reducer by mounting them
 * according to the given hierarchy.
 *
 * For example:
 *
 *   interactionsReducer = combineInteractions({
 *     entities: {
 *       todos: interactions.todos,
 *       users: interactions.users,
 *     },
 *     routes: interactions.routes,
 *   });
 *
 * It also sets the `mountPoint` on each interactions instance, according to
 * the given hierarchy.
 *
 * In the example above:
 *
 *   * `interactions.todos.mountPoint` would be `['entities', 'todos']`,
 *   * `interactions.users.mountPoint` would be `['entities', 'users']`,
 *   * `interactions.routes.mountPoint` would be `['routes']`,
 *
 */
export default function combineInteractions(spec:MountSpec):types.Reducer {
  const mountPaths = _findInteractions(spec);

  return (state:{} = {}, action:types.Action):{} => {
    for (let [path, interactions] of mountPaths) {
      let currentState = _.get(state, path);
      let newState:{};
      try {
        newState = interactions.reducer(currentState, action);
      } catch (error) {
        console.error(`Error in interactions reducer mounted at ${path.join('.')} with action:`, action, error);
        continue;
      }
      if (currentState === newState) continue;

      state = deepUpdate(state, path, {$set: newState});
    }

    return state;
  };
}

function _findInteractions(spec:MountSpec, path:string[] = []):_MountPath[] {
  const paths:_MountPath[] = [];

  _.each(spec, (value, key) => {
    const childPath = [...path, key];
    if (_.isPlainObject(value)) {
      paths.push(..._findInteractions(<MountSpec>value, childPath));
    } else {
      const interactions = <Interactions>value;
      interactions.mountPoint = childPath;
      paths.push([childPath, interactions]);
    }
  });

  return paths;
}
