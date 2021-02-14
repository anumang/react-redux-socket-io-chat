'use strict';
const uid = require('uid');
const chalk = require('chalk');
const env = require('../env');

const PublishPrivacy = {
  privateInRoom: 1,
  public: 2
}

const init = (server, store, pub, sub) => new Promise((resolve, reject) => {
  try {
    const io = require('socket.io')(server, { origins: env.HOST_URL + ':' + env.HOST_PORT + ' ' + env.SERVER_URL + ':' + env.SERVER_PORT });

    // Dummy subscribe
    sub.subscribe('In case of stopping redis.');

    sub.on('message', (channel, action) => {
      console.log(chalk.yellow('Socket: Publish action to channel ', channel, ' action:', action));
      action = JSON.parse(action);
      if (action.privacy === PublishPrivacy.public) {
        io.sockets.emit('action', { type: action.type, payload: action.payload });
      } else if (action.privacy === PublishPrivacy.privateInRoom) {
        io.sockets.in(channel).emit('action', { type: action.type, payload: action.payload });
      }
    });

    sub.on('subscribe', (channel, count) => {
      console.log(chalk.yellow('Socket: Subscribed to ' + channel + '. Sub subscribed to ' + count + ' channel(s).'));
    });

    sub.on('error', (err) => {
      console.error(chalk.red('Socket: Sub Error ' + err));
    });

    pub.on('error', (err) => {
      console.error(chalk.red('Socket: Pub Error ' + err));
    });
    io.sockets.on('connection', (socket) => {
      let connectedUser = {
        username: undefined,
        userId: undefined,
        roomId: undefined
      };

      console.log(chalk.blue('Socket: New client connected:', socket.id));

      function publish(channel, action) {
        pub.publish(channel, JSON.stringify(action));
      }

      function createRoom(payload) {
        console.log(chalk.blue('Socket: New room created: ' + JSON.stringify(payload)));
        sub.subscribe(payload.roomId);
        socket.join(payload.roomId);
      };

      function connectRoom(payload) {
        console.log(chalk.blue('Socket: New user connected: ' + JSON.stringify(payload)));
        sub.subscribe(payload.roomId);
        socket.join(payload.roomId);
        const action = {
          type: 'Socket/message',
          privacy: PublishPrivacy.privateInRoom,
          payload: { messageId: uid.uid(5), message: 'User ' + payload.username + ' connected.' }
        };
        publish(payload.roomId, action);
        const action2 = {
          type: 'Socket/user',
          privacy: PublishPrivacy.privateInRoom,
          payload: { username: payload.username, userId: payload.userId }
        };
        publish(payload.roomId, action2);
        // Set User
        connectedUser = { username: payload.username, userId: payload.userId, roomId: payload.roomId };
      };

      function reConnectRoom(payload) {
        console.log(chalk.blue('Socket: User re-connected: ' + JSON.stringify(payload)));
        sub.subscribe(payload.roomId);
        socket.join(payload.roomId);
        const action = {
          type: 'Socket/message',
          privacy: PublishPrivacy.privateInRoom,
          payload: { messageId: uid.uid(5), message: 'User ' + payload.username + ' re-connected.' }
        };
        publish(payload.roomId, action);
        const action2 = {
          type: 'Socket/user',
          privacy: PublishPrivacy.privateInRoom,
          payload: { username: payload.username, userId: payload.userId }
        };
        publish(payload.roomId, action2);
        // Set User
        connectedUser = { username: payload.username, userId: payload.userId, roomId: payload.roomId };
      };

      function sendMessage(payload) {
        console.log(chalk.blue('Socket: New message sent: ' + JSON.stringify(payload)));
        const action = {
          type: 'Socket/message',
          privacy: PublishPrivacy.privateInRoom,
          payload: { username: payload.username, userId: payload.userId, message: payload.message, messageId: payload.messageId }
        };
        publish(payload.roomId, action);
      };

      function disconnectRoom() {
        store.get(`chat_room_${connectedUser.roomId}_users`, (err, reply) => {
          let users = []
          if (reply) {
            users = JSON.parse(reply);
          }
          users = users.filter(x => x.userId !== connectedUser.userId);
          store.set(`chat_room_${connectedUser.roomId}_users`, JSON.stringify(users));
          console.log(chalk.blue('Socket: User successfully removed from store. userId / roomId :', connectedUser.userId, ' / ', connectedUser.roomId));
          if(!users.length) {
            sub.unsubscribe(connectedUser.roomId);
          }
          // Unset User
          connectedUser = {
            username: undefined,
            userId: undefined,
            roomId: undefined
          }
        });
      }

      socket.on('disconnect', () => {
        console.log(chalk.blue('Socket: User is left: ' + socket.id));
        if (connectedUser.userId && connectedUser.roomId) {
          const action = {
            type: 'Socket/message',
            privacy: PublishPrivacy.privateInRoom,
            payload: { message: 'User is left ' + connectedUser.username, messageId: uid.uid(5) }
          };
          publish(connectedUser.roomId, action);
          const action2 = {
            type: 'Socket/userLeft',
            privacy: PublishPrivacy.privateInRoom,
            payload: { username: connectedUser.username, userId: connectedUser.userId }
          };
          publish(connectedUser.roomId, action2);
          disconnectRoom();
        } else {
          console.log(chalk.blue('Socket: Could not process user left operation for socket ID : ' + socket.id));
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

    console.log(chalk.yellow('Socket: Socket is ready.'));
    resolve(io);
  } catch (e) {
    console.log(chalk.red('Socket: While starting socket, unexpected error occurred:', e.message));
    reject(e);
  }
})

module.exports = { init }
