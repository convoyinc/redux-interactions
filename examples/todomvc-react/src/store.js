import * as redux from 'redux';
import combinedReduction from 'combined-reduction';
import thunk from 'redux-thunk';

import * as interactions from './interactions';

export function createRootReducer() {
  return combinedReduction({
    todos: interactions.todos.reducer,
  });
}

export function createRootEnhancer({nativeAppInfo}) {
  const enhancers = [
    redux.applyMiddleware(
      thunk,
    ),
  ];

  if ('devToolsExtension' in global) {
    enhancers.push(window.devToolsExtension());
  }

  return redux.compose(...enhancers);
}

export function createStore(initialState) {
  return redux.createStore(
    createRootReducer(),
    initialState,
    createRootEnhancer(initialState),
  );
}
