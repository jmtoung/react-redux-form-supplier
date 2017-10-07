import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import registerServiceWorker from './registerServiceWorker';

import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import thunk from 'redux-thunk';
import { combineForms } from 'react-redux-form/immutable';
import { combineReducers } from 'redux-immutable';
import { composeWithDevTools } from 'redux-devtools-extension/developmentOnly';

import { fromJS } from 'immutable';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import injectTapEventPlugin from 'react-tap-event-plugin';
import Addresses from './reducer';

function logger({ getState }) {
  return next => (action) => {
    console.log('will dispatch', action);

    // Call the next dispatch method in the middleware chain.
    const returnValue = next(action);

    console.log('state after dispatch', getState());

    // This will likely be the action itself, unless
    // a middleware further in chain changed it.
    return returnValue;
  };
}

const initialSupplier = fromJS({
  name: '',
  countryName: '',
  countryCode: '',
  cityName: '',
  cityCode: '',
});

const rootReducer = combineReducers({
  Addresses,
  myForms: combineForms({
    supplier: initialSupplier,
  })
});

const initialState = fromJS({
  Addresses: {
    countries: [],
    cities: [],
  }
});

const store = createStore(
  rootReducer,
  initialState,
  compose(
    composeWithDevTools(
      applyMiddleware(thunk, logger)
    ),
  ),
);

injectTapEventPlugin();

ReactDOM.render(
  <MuiThemeProvider>
    <Provider store={store}>
      <App />
    </Provider>
  </MuiThemeProvider>,
  document.getElementById('root')
);
registerServiceWorker();
