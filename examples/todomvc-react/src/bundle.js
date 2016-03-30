import React from 'react';
import { render } from 'react-dom';
import 'todomvc-app-css/index.css';

import Root from './Root';

// Make react available globally, so we can use JSX without fear.
global.React = React;

render(<Root />, document.getElementById('root'));
