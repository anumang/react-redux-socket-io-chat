import { Map, fromJS, List } from 'immutable';
import { loop, Effects } from 'redux-loop-symbol-ponyfill';
import ChatRoomService from '../../services/chatRoom';


// Initial state
const initialState = Map({
  isLoading: false,
  username: null,
  userId: null,
  roomId: null,
  roomName: null,
  users: List([]),
  messages: List([]),
  connected: false,
  error: null
});

const SEND_ROOM_MESSAGE_REQEUST = 'Room/SEND_ROOM_MESSAGE_REQEUST';
const SEND_ROOM_MESSAGE_SUCCESS = 'Room/SEND_ROOM_MESSAGE_SUCCESS';
const SEND_ROOM_MESSAGE_FAIL = 'Room/SEND_ROOM_MESSAGE_FAIL';

const START_CONNECT_ROOM = 'Room/START_CONNECT_ROOM';
const SUCCESS_CONNECT_ROOM = 'Room/SUCCESS_CONNECT_ROOM';
const FAIL_CONNECT_ROOM = 'Room/FAIL_CONNECT_ROOM';

const START_RECONNECT_ROOM = 'Room/START_RECONNECT_ROOM';
const SUCCESS_RECONNECT_ROOM = 'Room/SUCCESS_RECONNECT_ROOM';
const FAIL_RECONNECT_ROOM = 'Room/FAIL_RECONNECT_ROOM';

const INITIALIZE_ROOM_MESSAGES = 'Room/INITIALIZE_ROOM_MESSAGES';
const SUCCESS_INITIALIZE_ROOM_MESSAGES = 'Room/SUCCESS_INITIALIZE_ROOM_MESSAGES';
const FAIL_INITIALIZE_ROOM_MESSAGES = 'Room/FAIL_INITIALIZE_ROOM_MESSAGES';

const INITIALIZE_ROOM_USERS = 'Room/INITIALIZE_ROOM_USERS';
const SUCCESS_INITIALIZE_ROOM_USERS = 'Room/SUCCESS_INITIALIZE_ROOM_USERS';
const FAIL_INITIALIZE_ROOM_USERS = 'Room/FAIL_INITIALIZE_ROOM_USERS';

const EMIT_SOCKET_MESSAGE = 'Socket/message';
const EMIT_SOCKET_USER = 'Socket/user';
const EMIT_SOCKET_USER_LEFT = 'Socket/userLeft';

export function sendMessage(username, userId, roomId, message) {
  return {
    type: SEND_ROOM_MESSAGE_REQEUST,
    payload: { username, userId, roomId, message }
  }
}

export function connectChatRoom(username, roomId) {
  return {
    type: START_CONNECT_ROOM,
    payload: { username, roomId }
  }
}

export function reConnectChatRoom(username, userId, roomId, roomName) {
  return {
    type: START_RECONNECT_ROOM,
    payload: { username, userId, roomId, roomName }
  }
}

export function initializeRoomMessages(username, userId, roomId) {
  return {
    type: INITIALIZE_ROOM_MESSAGES,
    payload: { username, userId, roomId }
  }
}

export function initializeRoomUsers(username, userId, roomId) {
  return {
    type: INITIALIZE_ROOM_USERS,
    payload: { username, userId, roomId }
  }
}

export async function sendMessageRequest(messageParams) {
  return await ChatRoomService.sendMessage(messageParams.username, messageParams.userId, messageParams.roomId, messageParams.message).then(res => {
    console.debug('RoomReducer: Successfullly sent message:', JSON.stringify(res));
    return {
      type: SEND_ROOM_MESSAGE_SUCCESS,
      payload: res
    };
  }).catch((error) => {
    console.error('RoomReducer: Message could not send. Error:', JSON.stringify(error));
    return {
      type: SEND_ROOM_MESSAGE_FAIL,
      payload: error
    };
  });
}

export async function connectChatRoomRequest(roomParams) {
  return await ChatRoomService.connectChatRoom(roomParams.username, roomParams.roomId).then(res => {
    console.debug('RoomReducer: Successfullly connected room ' + roomParams.roomId + ' res:', JSON.stringify(res));
    return {
      type: SUCCESS_CONNECT_ROOM,
      payload: res
    }
  }).catch((error) => {
    console.error('RoomReducer: Room could not connected. Error:', JSON.stringify(error));
    return {
      type: FAIL_CONNECT_ROOM,
      payload: error
    };
  });
}

export async function getRoomMessages(messageParams) {
  return await ChatRoomService.getMessages(messageParams.username, messageParams.userId, messageParams.roomId).then(res => {
    console.debug('RoomReducer: Successfullly get messages:', JSON.stringify(res));
    return {
      type: SUCCESS_INITIALIZE_ROOM_MESSAGES,
      payload: res.messages
    };
  }).catch((error) => {
    console.error('RoomReducer: Messages could not fetch. Error:' + JSON.stringify(error));
    return {
      type: FAIL_INITIALIZE_ROOM_MESSAGES,
      payload: error
    };
  });
}

export async function getRoomUsers(userParams) {
  return await ChatRoomService.getUsers(userParams.username, userParams.userId, userParams.roomId).then(res => {
    console.debug('RoomReducer: Successfullly get users:', JSON.stringify(res));
    return {
      type: SUCCESS_INITIALIZE_ROOM_USERS,
      payload: res.users
    };
  }).catch((error) => {
    console.error('RoomReducer: Users could not fetch. Error:', JSON.stringify(error));
    return {
      type: FAIL_INITIALIZE_ROOM_USERS,
      payload: error
    };
  });
}

export async function reConnectRequest(connectParams) {
  return await ChatRoomService.reConnectRoom(connectParams.username, connectParams.userId, connectParams.roomId, connectParams.roomName).then(res => {
    console.debug('Successfullly re-connected:' + JSON.stringify(res));
    return {
      type: SUCCESS_RECONNECT_ROOM,
      payload: res
    };
  }).catch((error) => {
    console.debug('Coul not re-connected Error:' + JSON.stringify(error));
    return {
      type: FAIL_RECONNECT_ROOM,
      payload: error
    };
  });
}

const socketConnectRoomAction = (roomId, username, userId) => { return { type: 'Socket/connectRoom', payload: { roomId, username, userId } }; };
const socketSendMessageAction = (roomId, username, userId, message, messageId) => { return { type: 'Socket/sendMessage', payload: { roomId, username, userId, message, messageId } }; };
const socketReconnectAction = (roomId, username, userId) => { return { type: 'Socket/reConnectRoom', payload: { roomId, username, userId } }; };


const appendMessage = (messages, msg) => {
  const newIMesg = fromJS(msg);
  return messages.includes(newIMesg) ? messages : messages.push(newIMesg);
}

const appendUser = (users, usr) => {
  const newIUsr = fromJS(usr);
  return users.includes(newIUsr) ? users : users.push(newIUsr);
}

const removeUser = (users, usr) => {
  return users.filter(x => x.get('userId') !== usr.userId);
}

export default function RoomReducer(state = initialState, action) {
  switch (action.type) {
    case START_CONNECT_ROOM:
      return loop(
        state
          .set('isLoading', true)
          .set('username', action.payload.username)
          .set('roomId', action.payload.roomId),
        Effects.promise(connectChatRoomRequest, action.payload)
      );
    case SUCCESS_CONNECT_ROOM:
      return loop(
        state.set('connected', true)
          .set('userId', action.payload.userId)
          .set('roomName', action.payload.roomName)
          .set('isLoading', false),
        Effects.constant(socketConnectRoomAction(action.payload.roomId, action.payload.username, action.payload.userId))
      );
    case SEND_ROOM_MESSAGE_REQEUST:
      return loop(
        state.set('isLoading', true),
        Effects.promise(sendMessageRequest, action.payload)
      );
    case SEND_ROOM_MESSAGE_SUCCESS:
      return loop(
        state.set('isLoading', false),
        Effects.constant(socketSendMessageAction(action.payload.roomId, action.payload.username, action.payload.userId, action.payload.message, action.payload.messageId))
      );
    case INITIALIZE_ROOM_MESSAGES:
      return loop(
        state.set('isLoading', true),
        Effects.promise(getRoomMessages, action.payload)
      );
    case INITIALIZE_ROOM_USERS:
      return loop(
        state.set('isLoading', true),
        Effects.promise(getRoomUsers, action.payload)
      );
    case SUCCESS_INITIALIZE_ROOM_MESSAGES:
      return state.set('messages', fromJS(action.payload))
        .set('isLoading', false);
    case SUCCESS_INITIALIZE_ROOM_USERS:
      return state.set('users', fromJS(action.payload))
        .set('isLoading', false);
    // Re-connect
    case START_RECONNECT_ROOM:
      return loop(
        state.set('isLoading', true)
          .set('connected', false)
          .set('error', null)
          .set('users', List([]))
          .set('messages', List([])),
        Effects.promise(reConnectRequest, action.payload)
      );
    case SUCCESS_RECONNECT_ROOM:
      return loop(
        state.set('isLoading', false)
          .set('userId', action.payload.userId)
          .set('roomName', action.payload.roomName)
          .set('connected', true),
        Effects.constant(socketReconnectAction(action.payload.roomId, action.payload.username, action.payload.userId))
      );
    case FAIL_INITIALIZE_ROOM_MESSAGES:
    case FAIL_INITIALIZE_ROOM_USERS:
    case FAIL_CONNECT_ROOM:
    case SEND_ROOM_MESSAGE_FAIL:
    case FAIL_RECONNECT_ROOM:
      return state.set('isLoading', false)
        .set('error', action.payload);
    // Socket Actions
    case EMIT_SOCKET_MESSAGE:
      return state.update('messages', messages => appendMessage(messages, action.payload));
    case EMIT_SOCKET_USER:
      return state.update('users', users => appendUser(users, action.payload));
    case EMIT_SOCKET_USER_LEFT:
      return state.update('users', users => removeUser(users, action.payload));
    default:
      return state;
  }

}