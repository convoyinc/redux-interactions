# redux-interactions

A streamlined approach to managing your [Redux](http://redux.js.org/) action creators and reducers.

For a TL;DR of what this package provides, you can skip down to [Streamlining The Pattern](#streamlining-the-pattern).


## A Pattern

From using Flux/Redux for a while, we've observed a few things:

* Developers naturally think of action creators and reducers as a group of code (i.e. each action creator tends to be associated with a single piece of reducer logic).
* When we make use of broad actions that are consumed by multiple reducers, it quickly becomes difficult to track/test/maintain all of the _effects_ of that action.
* A lot of business logic is necessarily asynchronous, which can't be encapsulated in a reducer.

These observations have landed us on a pattern where you group related action creators and reducers into a single file, which we call an _interaction_.

For example, a hypothetical, offline-only, todos app might have a "todos" interaction that manages the state of the todos being displayed to the user:

`todos.js`:
```js
// Action types
const ADD_TODO = 'ADD_TODO';
const TOGGLE_TODO = 'TOGGLE_TODO';

// Action Creators

export function add(id, text, completed = false) {
  return {type: ADD_TODO, id, text, completed};
}

export function toggle(id) {
  return {type: TOGGLE_TODO};
}

// Reducers

export function reducer(state = [], action) {
  switch (action.type) {
    case ADD_TODO:
      return _reduceAdd(state, action);
    case TOGGLE_TODO:
      return _reduceToggle(state, action);
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
```

The store would wire it up by referencing `todos.reducer`, and components would trigger actions via a `dispatch(todos.add())`, etc.  Hopefully a pretty straightforward pattern.

The interesting outcome of this approach is that it subtly changes your approach to managing business logic: Each action/reducer pair tends to encapsulate a single _state modification_, rather than an a swath of business logic.  More complicated business logic naturally flows via thunked actions that _complete_ all of our state modification actions/reducers.

For example, if we wanted to add a server to the mix, we might modify the above interaction to include another action creator:

`todos.js`:
```js
…
export function addLocal(id, text, completed = false) {
  return {type: ADD_TODO, id, text, completed};
}

export function add(text, completed = false) {
  return async (dispatch, _getState) => {
    const todo = {id: uuid.v4(), text, completed, saving: true};
    // Optimisticaly add the todo to the store for immediate user feedback.
    dispatch(addLocal(todo));

    try {
      // Lets assume this succeeds for any 2xx; and we assume that means the
      // todo was successfully persisted.
      apiRequest('post', '/todos', {body: todo});
      dispatch(markSaved(todo.id));
    } catch (error) {
      // TERRIBLE user experience, but this is just an example.
      dispatch(flash.error(`Failed to save todo, please try again`));
      dispatch(removeLocal(todo.id));
    }
  };
}
…
```

This new action creator nicely encapsulates all business logic around adding a todo to the application.  For ease of discussion, let's call it a _business action (creator)_.  And the more focused state modification actions like `addLocal` as _state action (creators)_.

Business actions very rarely dispatch a raw action directly.  Instead, they compose state actions and frequently perform asynchronous workflows.


## Streamlining The Pattern

Now that we have that pattern in place, we can look at codifying it a bit more.  Notice all the boilerplate surrounding state actions?  Yeah, we can do better.

```js
import { Interactions, reducer } from 'redux-interactions';

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
   * Initial state for the subset of the store managed by these interactions.
   */
  initialState = [];

  /**
   * Add a todo.
   *
   * `@reducer` takes care of the boilerplate of state actions for you:
   *
   * 1. It generates a unique action type, based on the name of the interactions
   * class and method.  In this case: `TODOS:ADD`.
   *
   * 2. It generates an action creator by the same name, that packages up any
   * arguments passed to it.  In this case:
   *
   *   add(...args) {
   *     return {type: 'TODOS:ADD', args};
   *   }
   *
   * 3. It registers the decorated function to be run when that action type is
   * encountered.  `state` is always the first argument, `action.args` are
   * expanded to be the rest of the arguments.
   */
  @reducer
  add(state, id, text, completed = false) {
    return [
      ...state,
      {id, text, completed},
    ];
  }

  /**
   * Toggle a todo's completion state.
   *
   * You can also specify a custom action type, if you like.
   *
   * Because `@reducer` generates types based on function names, which can be
   * mangled by uglify, the generated type is not human understandible in that
   * environment.  If you prefer to have your action types easily traceable,
   * even in production, consider passing explicit action types.
   */
  @reducer('CUSTOM_TODOS_TOGGLE')
  toggle(state, id) {
    return state.map(todo => {
      if (todo.id !== id) return todo;
      return {
        ...todo,
        completed: !todo.completed,
      };
    });
  }

};
```
