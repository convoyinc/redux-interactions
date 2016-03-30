import { Interactions, reducer } from 'redux-interactions';
import * as uuid from 'uuid';

export default new class Todos extends Interactions {

  initialState = [
    {
      text: 'Use redux-interactions',
      completed: false,
      id: uuid.v4(),
    },
  ];

  @reducer
  add(state, text) {
    return [
      {id: uuid.v4(), completed: false, text},
      ...state,
    ];
  }

  @reducer
  delete(state, id) {
    return state.filter(t => t.id !== id);
  }

  @reducer
  edit(state, id, text) {
    return state.map(todo => {
      if (todo.id !== id) return todo;
      return {...todo, text};
    });
  }

  @reducer
  toggle(state, id) {
    return state.map(todo => {
      if (todo.id !== id) return todo;
      return {...todo, completed: !todo.completed};
    });
  }

  @reducer
  toggleAll(state) {
    const areAllComplete = state.every(t => t.completed);
    return state.map(t => ({...t, completed: !areAllComplete}));
  }

  @reducer
  clearCompleted(state) {
    return state.filter(t => !t.completed);
  }

}
