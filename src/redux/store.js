
import {applyMiddleware, createStore} from 'redux';
import {composeWithDevTools} from 'redux-devtools-extension/developmentOnly';
import * as reduxLoop from 'redux-loop-symbol-ponyfill';
import {createLogger} from 'redux-logger';
import promiseMiddleware from 'redux-promise';
import thunkMiddleware from 'redux-thunk';
import reducer from './reducer';
import {SERVER_URL, SERVER_PORT} from '../../env';

// Redux Socket middleware
import createSocketIoMiddleware from 'redux-socket.io';
import io from 'socket.io-client';
let socket = io(SERVER_URL + ':' + SERVER_PORT);
let socketIoMiddleware = createSocketIoMiddleware(socket, 'Socket/');

import {routerMiddleware} from 'react-router-redux';
import createHistory from 'history/createBrowserHistory';

export const history = createHistory();


const loggerMiddleware = createLogger({
});

// Build the middleware for intercepting and dispatching navigation actions
const myRouterMiddleware = routerMiddleware(history);

const enhancers = [
  reduxLoop.install(),
  applyMiddleware(socketIoMiddleware,
    myRouterMiddleware, promiseMiddleware, thunkMiddleware, loggerMiddleware)
];

export const store = createStore(
  reducer, composeWithDevTools(...enhancers));
