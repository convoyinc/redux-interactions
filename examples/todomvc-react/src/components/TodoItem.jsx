import { Component, PropTypes } from 'react'
import classnames from 'classnames'

import TodoTextInput from './TodoTextInput';

export default class TodoItem extends Component {

  static propTypes = {
    todo: PropTypes.object.isRequired,
    actions: PropTypes.object.isRequired,
  }

  state = {editing: false}

  render() {
    const {todo} = this.props;
    const {editing} = this.state;

    return (
      <li className={classnames({completed: todo.completed, editing: this.state.editing})}>
        {editing ? this._renderEditing() : this._renderIdle()}
      </li>
    )
  }

  _renderEditing() {
    const {todo} = this.props;

    return (
      <TodoTextInput
        text={todo.text}
        editing={true}
        onSave={(text) => this._onSave(todo.id, text)}
      />
    );
  }

  _renderIdle() {
    const {todo, actions} = this.props;

    return (
      <div className='view'>
        <input
          className='toggle'
          type='checkbox'
          checked={todo.completed}
          onChange={() => actions.todos.toggle(todo.id)}
        />
        <label onDoubleClick={this._onDoubleClick}>
          {todo.text}
        </label>
        <button
          className='destroy'
          onClick={() => actions.todos.delete(todo.id)}
        />
      </div>
    );
  }

  _onDoubleClick = () => {
    this.setState({editing: true});
  }

  _onSave = (id, text) => {
    const {actions} = this.props;
    if (text.length === 0) {
      actions.todos.delete(id);
    } else {
      actions.todos.edit(id, text);
    }
    this.setState({editing: false});
  }

}
