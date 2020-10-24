import React from 'react';
import { render } from '@testing-library/react';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducers from '../../reducers';

import App from './App';

const store = createStore(reducers, applyMiddleware(thunk));

test('App is being rendered', () => {
  const { getByText } = render(<Provider store={store}><App /></Provider>);
  const linkElement = getByText(/React Todo/i);
  expect(linkElement).toBeInTheDocument();
});
