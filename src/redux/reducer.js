
import {Map, fromJS} from 'immutable';
import {loop, combineReducers} from 'redux-loop-symbol-ponyfill';
import {routerReducer} from 'react-router-redux';
import RoomReducer from '../modules/room/roomReducer';
import HomeReducer from '../modules/home/homeReducer';

const reducers = {
  home: HomeReducer,
  room: RoomReducer,
  router: routerReducer
};

// initial state, accessor and mutator for supporting root-level
// immutable data with redux-loop reducer combinator
const immutableStateContainer = Map();
const getImmutable = (child, key) => child ? child.get(key) : void 0;
const setImmutable = (child, key, value) => child.set(key, value);

const namespacedReducer = combineReducers(
  reducers,
  immutableStateContainer,
  getImmutable,
  setImmutable
);

export default function mainReducer(state, action) {
  const [nextState, effects] = namespacedReducer(state || void 0, action);

  // enforce the state is immutable
  return loop(fromJS(nextState), effects);
}
