import { Component, PropTypes } from 'react';

import TodoTextInput from './TodoTextInput';

export default class Header extends Component {

  static propTypes = {
    addTodo: PropTypes.func.isRequired,
  }

  render() {
    return (
      <header className="header">
        <h1>todos</h1>
        <TodoTextInput
          newTodo
          onSave={this._onSave}
          placeholder="What needs to be done?"
        />
      </header>
    );
  }

  _onSave = (text) => {
    if (text.length === 0) return;
    this.props.addTodo(text);
  }

}
