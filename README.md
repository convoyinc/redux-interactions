# redux-interactions

A streamlined approach to managing your [Redux](http://redux.js.org/) action creators and reducers.

For a TL;DR of what this package provides, you can skip down to [Streamlining The Pattern](#streamlining-the-pattern).

If you wish to see it in practice, check out [`examples/todomvc-react`](./examples/todomvc-react).  You can run it locally by checking out this repository and running `npm run example`.


## A Pattern

From using Flux/Redux for a while, we've observed a few things:

* Developers naturally think of action creators and reducers as a group of code (i.e. each action creator tends to be associated with a single piece of reducer logic).
* When we make use of broad actions that are consumed by multiple reducers, it quickly becomes difficult to track/test/maintain all of the _effects_ of that action.
* A lot of business logic is necessarily asynchronous, which can't be encapsulated in a reducer.
* Most reducers are singletons, and

These observations have landed us on a pattern where you group related action creators, reducers, and selectors into a single file, which we call an _interaction_.

For example, a hypothetical, offline-only, todos app might have a "todos" interaction that manages the state of the todos being displayed to the user:

`todos.js`:
```js
import * as _ from 'lodash';

// Action types
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';
const REMOVE_TODO = 'REMOVE_TODO';

// Where in the store the reducer should be mounted.
export const MOUNT_POINT = ['entities', 'todos'];

// Selectors

export function getAll(state) {
  return _.values(_.get(state, MOUNT_POINT));
}

export function getById(state, id) {
  return _.get(state, [...MOUNT_POINT, id]);
}

// Action Creators

export function add(text, completed = false) {
  return async (dispatch, _getState) => {
    const todo = {id: uuid.v4(), text, completed, saving: true};
    // Optimisticaly add the todo to the store for immediate user feedback.
    dispatch(addLocal(todo));

    try {
      // Lets assume this succeeds for any 2xx; and we assume that means the
      // todo was successfully persisted.
      apiRequest('post', '/todos', {body: todo});
    } catch (error) {
      // TERRIBLE user experience, but this is just an example.
      alert(`Failed to save todo, please try again`);
      dispatch(removeLocal(todo.id));
    }
  };
}

export function addLocal(id, text, completed = false) {
  return {type: ADD_TODO, id, text, completed};
}

export function toggleLocal(id) {
  return {type: TOGGLE_TODO};
}

export function removeLocal(id, id) {
  return {type: REMOVE_TODO, id};
}

// Reducers

export function reducer(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return _reduceAdd(state, action);
    case TOGGLE_TODO:
      return _reduceToggle(state, action);
    case REMOVE_TODO:
      return _reduceRemove(state, action);
    default:
      return state;
  }
}

function _reduceAdd(state, action) {
  return [
    ...state,
    {id, text, completed},
  ];
}

function _reduceToggle(state, action) {
  return state.map(todo => {
    if (todo.id !== id) return todo;
    return {
      ...todo,
      completed: !todo.completed,
    };
  });
}

function _reduceRemove(state, action) {
  return _.omit(state, action.id);
}
```

The store would wire it up by mounting `todos.reducer` at `entities.todos`, and components would trigger actions via a `dispatch(todos.add())`, etc.  Components use `todos.getById` and `todos.getAll` to retrieve state from that slice of the store.

The interesting outcome of this approach is that it subtly changes your approach to managing business logic: Each action/reducer pair tends to encapsulate a single _state modification_, rather than an a swath of business logic.  More complicated business logic naturally flows via thunked actions that _complete_ all of our state modification actions/reducers.


## Streamlining The Pattern

Now that we have that pattern in place, we can look at codifying it a bit more.  Notice all the boilerplate surrounding state actions?  Yeah, we can do better.

```js
import { Interactions, reducer, selector } from 'redux-interactions';

/**
 * The `Interactions` class helps you manage the boilerplate of a reducer that
 * dispatches to specific reducers per action type.
 *
 * It exposes a `reducer` method for you to bind into your store.
 *
 * Also, notice that we are immediately _instantiating_ and exporting an
 * instance of this class so that you can dispatch its actions in a
 * straightforward manner.  I.e. `dispatch(todos.toggle(id))`.
 *
 * `Interactions` also provides a bit of additional utility via its
 * constructor:
 *
 *   * All public methods are bound to the instance, guaranteeing that `this` is
 *     always correct regardless of how the method is called.
 *
 *   * The class is exposed as a property on the instance, to aid unit testing.
 *     For example, `todos.Todos`.
 *
 */
export default new class Todos extends Interactions {

  /**
   * The path in the store that this interactions' reducer should be mounted at.
   */
  mountPoint = ['entities', 'todos'];

  /**
   * Initial state for the subset of the store managed by these interactions.
   */
  initialState = [];

  /**
   * Selects all todos in the store.
   */
  @selector
  getAll(scopedState) {
    return _.values(scopedState);
  }

  /**
   * Selects a single todo by id.
   */
  @selector
  getById(scopedState, id) {
    return scopedState[id];
  }

  /**
   * Add a todo and let the server know.
   *
   * This rounds off the example, in an effort to show off the pattern.  Note
   * that this method is purely an action creator; there's nothing special going
   * on here.
   */
  add(text, completed = false) {
    return async (dispatch, _getState) => {
      const todo = {id: uuid.v4(), text, completed, saving: true};
      // Optimisticaly add the todo to the store for immediate user feedback.
      dispatch(this.addLocal(todo));

      try {
        // Lets assume this succeeds for any 2xx; and we assume that means the
        // todo was successfully persisted.
        apiRequest('post', '/todos', {body: todo});
        dispatch(this.markSaved(todo.id));
      } catch (error) {
        // TERRIBLE user experience, but this is just an example.
        alert(`Failed to save todo, please try again`);
        dispatch(this.removeLocal(todo.id));
      }
    };
  }

  /**
   * Add a todo, without involving the server.
   *
   * `@reducer` takes care of the boilerplate of state actions for you:
   *
   * 1. It generates a unique action type, based on the name of the interactions
   * class and method.  In this case: `TODOS:ADD_LOCAL`.
   *
   * 2. It generates an action creator by the same name, that packages up any
   * arguments passed to it.  In this case:
   *
   *   addLocal(...args) {
   *     return {type: 'TODOS:ADD_LOCAL', args};
   *   }
   *
   * 3. It registers the decorated function to be run when that action type is
   * encountered.  `scopedState` is always the first argument, `action.args` are
   * expanded to be the rest of the arguments.
   */
  @reducer
  addLocal(scopedState, id, text, completed = false) {
    return [
      ...scopedState,
      {id, text, completed},
    ];
  }

  /**
   * Toggle a todo's completion state, locally.
   *
   * You can also specify a custom action type, if you like.
   *
   * Because `@reducer` generates types based on function names, which can be
   * mangled by uglify, the generated type is not human understandible in that
   * environment.  If you prefer to have your action types easily traceable,
   * even in production, consider passing explicit action types.
   */
  @reducer('CUSTOM_TODOS_TOGGLE')
  toggleLocal(scopedState, id) {
    return scopedState.map(todo => {
      if (todo.id !== id) return todo;
      return {
        ...todo,
        completed: !todo.completed,
      };
    });
  }

  /**
   * Removes a todo locally.
   */
  @reducer
  removeLocal(scopedState, id) {
    return _.omit(scopedState, id);
  }

};
```


## Mounting Interactions

Interactions need to be aware of where they are mounted in the store, since they are providing selectors.  In order to centralize the store's configuration, you will probably want to use `combineInteractions()` to mount them, and to set their mount points:

```js
import * as interactions from './interactions';

/**
 * Returns a reducer with all interactions mounted according to the given
 * hierarchy.
 *
 * This will _modify_ any interactions passed in, setting their `mountPoint` to
 * match the location in the store that they are being mounted at.  It is an
 * error to pass interactions that specify their own `mountPoint`.
 */
const interactionsReducer = combineInteractions({
  entities: {
    todos: interaction.todos,
  },
});
```
