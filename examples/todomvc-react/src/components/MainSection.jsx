import { Component, PropTypes } from 'react';

import { filters } from '../constants';
import Footer from './Footer';
import TodoItem from './TodoItem';

const TODO_FILTERS = {
  [filters.ALL]: () => true,
  [filters.ACTIVE]: todo => !todo.completed,
  [filters.COMPLETED]: todo => todo.completed
};

export default class MainSection extends Component {

  static propTypes = {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
  }

  state = {filter: filters.ALL}

  render() {
    const {todos, actions} = this.props;
    const {filter} = this.state;

    const filteredTodos = todos.filter(TODO_FILTERS[filter]);
    const completedCount = todos.reduce((c, t) => t.completed ? c + 1 : c, 0);

    return (
      <section className='main'>
        {this._renderToggleAll(completedCount)}
        <ul className='todo-list'>
          {filteredTodos.map(todo =>
            <TodoItem key={todo.id} todo={todo} actions={actions} />
          )}
        </ul>
        {this._renderFooter(completedCount)}
      </section>
    );
  }

  _renderToggleAll(completedCount) {
    const {todos, actions} = this.props;
    if (todos.length == 0) return null;
    return (
      <input
        className='toggle-all'
        type='checkbox'
        checked={completedCount === todos.length}
        onChange={actions.todos.toggleAll}
      />
    );
  }

  _renderFooter(completedCount) {
    const {todos} = this.props;
    const {filter} = this.state;
    if (!todos.length) return null;
    const activeCount = todos.length - completedCount;

    return (
      <Footer
        completedCount={completedCount}
        activeCount={activeCount}
        filter={filter}
        onClearCompleted={this._onClearCompleted}
        onShow={this._onShow}
      />
    );
  }

  _onClearCompleted = () => {
    this.props.actions.todos.clearCompleted();
  }

  _onShow = (filter) => {
    this.setState({filter});
  }

}
