import { Component } from 'react';
import { Provider } from 'react-redux';

import { App } from './containers';
import { createStore } from './store';

export default class Root extends Component {

  state = {};

  componentWillMount() {
    this._initializeStore();
  }

  render() {
    if (!this.state.store) return null;
    return (
      <Provider store={this.state.store}>
        <App />
      </Provider>
    );
  }

  // App Initialization

  _initializeStore() {
    // This is where you would want to load any persisted state to rehydrate
    // your store with.

    this.setState({
      store: createStore({}),
    });

    // We can hot reload reducers, but not the store itself (yet). This is
    // because <Provider>, @connect do not check for context updates.
    if (module.hot) {
      module.hot.accept('./store', () => {
        this.state.store.replaceReducer(require('./store').createRootReducer());
      });
    }
  }

}
