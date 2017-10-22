'use strict';
const uid = require('uid');
const env = require('../env');

const PublishPrivacy = {
  privateInRoom: 1,
  public: 2
}

// To hold client info. TODO: Find a better way
let clients = {};

const init = (server, store, pub, sub) => new Promise((resolve, reject) => {
  try {
    const io = require('socket.io')(server, { origins: env.HOST_URL + ':' + env.HOST_PORT + ' ' + env.SERVER_URL + ':' + env.SERVER_PORT });
    // Dummy subscribe
    sub.subscribe('In case of stopping redis.');

    sub.on('message', (channel, action, socket) => {
      console.log('Socket: Publish action to channel ', channel, ' action:', action);
      action = JSON.parse(action);
      if (action.privacy === PublishPrivacy.public) {
        io.sockets.emit('action', { type: action.type, payload: action.payload });
      } else if (action.privacy === PublishPrivacy.privateInRoom) {
        io.sockets.in(channel).emit('action', { type: action.type, payload: action.payload });
      }
    });

    sub.on('subscribe', (channel, count) => {
      console.log('Socket: Subscribed to ' + channel + '. Sub subscribed to ' + count + ' channel(s).');
    });

    sub.on('error', (err) => {
      console.log('Socket: Sub Error ' + err);
    });

    pub.on('error', (err) => {
      console.log('Socket: Pub Error ' + err);
    });

    io.sockets.on('connection', (socket) => {

      console.log('Socket: New client connected:', socket.id);

      function publish(channel, action) {
        pub.publish(channel, JSON.stringify(action));
      }

      function createRoom(payload) {
        console.log('Socket: New room created: ' + JSON.stringify(payload));
        sub.subscribe(payload.roomId);
        socket.join(payload.roomId);
      };

      function connectRoom(payload) {
        console.log('Socket: New user connected: ' + JSON.stringify(payload));
        sub.subscribe(payload.roomId);
        socket.join(payload.roomId);
        clients[socket.id] = {};
        clients[socket.id].userId = payload.userId;
        clients[socket.id].username = payload.username;
        clients[socket.id].roomId = payload.roomId;
        const action = {
          type: 'Socket/message',
          privacy: PublishPrivacy.privateInRoom,
          payload: { messageId: uid(5), message: 'User ' + payload.username + ' connected.' }
        };
        publish(payload.roomId, action);
        const action2 = {
          type: 'Socket/user',
          privacy: PublishPrivacy.privateInRoom,
          payload: { username: payload.username, userId: payload.userId }
        };
        publish(payload.roomId, action2);
      };

      function reConnectRoom(payload) {
        console.log('Socket: User re-connected: ' + JSON.stringify(payload));
        sub.subscribe(payload.roomId);
        socket.join(payload.roomId);
        clients[socket.id] = {};
        clients[socket.id].userId = payload.userId;
        clients[socket.id].username = payload.username;
        clients[socket.id].roomId = payload.roomId;
        const action = {
          type: 'Socket/message',
          privacy: PublishPrivacy.privateInRoom,
          payload: { messageId: uid(5), message: 'User ' + payload.username + ' re-connected.' }
        };
        publish(payload.roomId, action);
        const action2 = {
          type: 'Socket/user',
          privacy: PublishPrivacy.privateInRoom,
          payload: { username: payload.username, userId: payload.userId }
        };
        publish(payload.roomId, action2);
      };

      function sendMessage(payload) {
        console.log('Socket: New message sent: ' + JSON.stringify(payload));
        var action = {
          type: 'Socket/message',
          privacy: PublishPrivacy.privateInRoom,
          payload: { username: payload.username, userId: payload.userId, message: payload.message, messageId: payload.messageId }
        };
        publish(payload.roomId, action);
      };

      socket.on('disconnect', () => {
        console.log('Socket: User is left: ' + socket.id);
        // TODO: Try to find better way to handle left user
        if (clients[socket.id]) {
          var action = {
            type: 'Socket/message',
            privacy: PublishPrivacy.privateInRoom,
            payload: { message: 'User is left ' + clients[socket.id].username, messageId: uid(5) }
          };
          publish(clients[socket.id].roomId, action);
          const action2 = {
            type: 'Socket/userLeft',
            privacy: PublishPrivacy.privateInRoom,
            payload: { username: clients[socket.id].username, userId: clients[socket.id].userId }
          };
          publish(clients[socket.id].roomId, action2);
          store.get(`chat_room_${clients[socket.id].roomId}_users`, (err, reply) => {
            let users = []
            if (reply) {
              users = JSON.parse(reply);
            }
            const userId = uid(5);
            users = users.filter(x => x.userId !== clients[socket.id].userId);
            store.set(`chat_room_${clients[socket.id].roomId}_users`, JSON.stringify(users));
            console.log('Socket: User successfully removed from store. userId / roomId :', clients[socket.id].userId, ' / ', clients[socket.id].roomId);
            delete clients[socket.id];
          });
        } else {
          console.log('Socket: Could not process user left operation for socket ID : ' + socket.id);
        }
      });

      // Events as Redux Store Action
      socket.on('action', (action) => {
        if (action.type === 'Socket/createRoom') {
          createRoom(action.payload);
        }
        else if (action.type === 'Socket/connectRoom') {
          connectRoom(action.payload);
        }
        else if (action.type === 'Socket/sendMessage') {
          sendMessage(action.payload);
        }
        else if (action.type === 'Socket/reConnectRoom') {
          reConnectRoom(action.payload);
        }
      });
    });

    console.log('Socket: Socket is ready.');
    resolve();
  } catch (e) {
    console.log('Socket: While starting socket, unexpected error occured:', e);
    reject(e);
  }
})

module.exports = { init }