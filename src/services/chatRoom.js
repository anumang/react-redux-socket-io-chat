
import axios from 'axios';
import {SERVER_URL, SERVER_PORT} from '../../env';

axios.defaults.baseURL = SERVER_URL + ':' + SERVER_PORT;
axios.defaults.headers.post['Content-Type'] = 'application/json';

export async function createWathcRoom(roomName) {
  return axios.post('/api/createRoom', {roomName})
    .then(res => {
      return res.data;
    });
}

export async function connectChatRoom(username, roomId) {
  return axios.post('/api/connectRoom', {username, roomId})
    .then(res => {
      return res.data;
    });
}

export async function sendMessage(username, userId, roomId, message) {
  return axios.post('/api/sendMessage', {username, userId, roomId, message})
    .then(res => {
      return res.data;
    });
}

export async function getMessages(username, userId, roomId) {
  return axios.post('/api/getMessages', {username, userId, roomId})
    .then(res => {
      return res.data;
    });
}

export async function getUsers(username, userId, roomId) {
  return axios.post('/api/getUsers', {username, userId, roomId})
    .then(res => {
      return res.data;
    });
}

export async function reConnectRoom(username, userId, roomId, roomName) {
  return axios.post('/api/reConnectRoom', {username, userId, roomId, roomName})
    .then(res => {
      return res.data;
    });
}

const ChatRoomService = {createWathcRoom, connectChatRoom, sendMessage, getMessages, getUsers, reConnectRoom};

export default ChatRoomService;
