import { PropTypes, Component } from 'react';
import classnames from 'classnames'

import { filters } from '../constants';

const FILTER_TITLES = {
  [filters.ALL]: 'All',
  [filters.ACTIVE]: 'Active',
  [filters.COMPLETED]: 'Completed',
};

export default class Footer extends Component {

  static propTypes = {
    completedCount: PropTypes.number.isRequired,
    activeCount: PropTypes.number.isRequired,
    filter: PropTypes.string.isRequired,
    onClearCompleted: PropTypes.func.isRequired,
    onShow: PropTypes.func.isRequired,
  }

  render() {
    return (
      <footer className='footer'>
        {this._renderTodoCount()}
        <ul className='filters'>
          {Object.keys(filters).map(filter =>
            <li key={filter}>
              {this._renderFilterLink(filter)}
            </li>
          )}
        </ul>
        {this._renderClearButton()}
      </footer>
    );
  }

  _renderTodoCount() {
    const {activeCount} = this.props;
    const itemWord = activeCount === 1 ? 'item' : 'items';

    return (
      <span className='todo-count'>
        <strong>{activeCount || 'No'}</strong> {itemWord} left
      </span>
    );
  }

  _renderFilterLink(filter) {
    const {filter: selectedFilter, onShow} = this.props;

    return (
      <a className={classnames({selected: filter === selectedFilter})}
         style={{cursor: 'pointer'}}
         onClick={() => onShow(filter)}>
        {FILTER_TITLES[filter]}
      </a>
    );
  }

  _renderClearButton() {
    const {completedCount, onClearCompleted} = this.props
    if (!completedCount) return;
    return (
      <button
        className='clear-completed'
        onClick={onClearCompleted}
      >
        Clear completed
      </button>
    );
  }

}
