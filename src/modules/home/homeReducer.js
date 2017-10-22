
import {Map} from 'immutable';
import {loop, Effects} from 'redux-loop-symbol-ponyfill';
import {push} from 'react-router-redux';
import ChatRoomService from '../../services/chatRoom';


// Initial state
const initialState = Map({
  success: false,
  roomName: '',
  isLoading: false
});

const CREATE_CHAT_ROOM_REQEUST = 'HomeReducer/CREATE_CHAT_ROOM_REQUEST';
const CREATE_CHAT_ROOM_SUCCESS = 'HomeReducer/CREATE_CHAT_ROOM_SUCCESS';
const CREATE_CHAT_ROOM_FAIL = 'HomeReducer/CREATE_CHAT_ROOM_FAIL';


export function createChatRoom(roomName) {
  return {
    type: CREATE_CHAT_ROOM_REQEUST,
    payload: roomName
  };
}

export async function createChatRoomRequest(roomName) {
  return await ChatRoomService.createWathcRoom(roomName).then(res => {
    console.debug('HomeReducer: Watch room successfully created. with response: ', JSON.stringify(res));
    return {
      type: CREATE_CHAT_ROOM_SUCCESS,
      payload: res
    };
  }).catch(e => {
    console.error('HomeReducer: While opening room there is a error occured: ', JSON.stringify(e));
    return {
      type: CREATE_CHAT_ROOM_FAIL
    };
  });
}
const socketCreateRoomAction = (roomId) => { return {type: 'Socket/createRoom', payload: {roomId}}; };
const navigateChatRoomAction = (roomId) => push('/room/' + roomId);

export default function HomeReducer(state = initialState, action) {
  switch (action.type) {
    case CREATE_CHAT_ROOM_REQEUST:
      return loop(
        state.set('isLoading', true),
        Effects.promise(createChatRoomRequest, action.payload)
      );
    case CREATE_CHAT_ROOM_SUCCESS:
      return loop(
        state
          .set('isLoading', false)
          .set('success', true)
          .set('roomName', action.payload.roomName),
        Effects.batch([
          Effects.constant(navigateChatRoomAction(action.payload.newRoomId)),
          Effects.constant(socketCreateRoomAction(action.payload.newRoomId))
        ])
      );
    case CREATE_CHAT_ROOM_FAIL:
      return state.set('isLoading', false);
    default:
      return state;
  }

}
