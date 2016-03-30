import { Component, PropTypes } from 'react'
import classnames from 'classnames'

export default class TodoTextInput extends Component {

  static propTypes = {
    onSave: PropTypes.func.isRequired,
    text: PropTypes.string,
    placeholder: PropTypes.string,
    editing: PropTypes.bool,
    newTodo: PropTypes.bool,
  }

  constructor(props, context) {
    super(props, context)
    this.state = {
      text: this.props.text || '',
    };
  }

  render() {
    const {editing, newTodo, placeholder} = this.props;
    const {text} = this.state;

    return (
      <input
        className={classnames({edit: editing, 'new-todo': newTodo})}
        type="text"
        placeholder={placeholder}
        autoFocus="true"
        value={text}
        onBlur={this._onBlur}
        onChange={this._onChange}
        onKeyDown={this._onSubmit}
      />
    );
  }


  _onSubmit = (e) => {
    if (e.which !== 13) return;
    const text = e.target.value.trim();

    this.props.onSave(text);
    if (this.props.newTodo) {
      this.setState({text: ''});
    }
  }

  _onChange = (e) => {
    this.setState({text: e.target.value});
  }

  _onBlur = (e) => {
    if (this.props.newTodo) return;
    this.props.onSave(e.target.value);
  }

}
