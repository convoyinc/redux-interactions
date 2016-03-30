import { bindActionCreators } from 'redux';
import { Component, PropTypes } from 'react';
import { connect } from 'react-redux';

import { MainSection, Header } from '../components';
import { propTypes } from '../constants';
import { todos } from '../interactions';

@connect(state => ({
  todos: state.todos,
}), dispatch => ({
  actions: {
    todos: bindActionCreators(todos, dispatch),
  },
}))
export default class App extends Component {

  static propTypes = {
    todos: PropTypes.array.isRequired,
    actions: PropTypes.object.isRequired,
  }

  render() {
    const {todos, actions} = this.props;
    return (
      <div>
        <Header addTodo={actions.todos.add} />
        <MainSection todos={todos} actions={actions} />
      </div>
    );
  }

}
