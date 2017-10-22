'use strict';
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser')
const path = require('path');
const uid = require('uid');
const env = require('../env');
const app = express();

const init = (store) => new Promise((resolve, reject) => {
  try {
    //CORS middleware
    const allowCrossDomain = (req, res, next) => {
      res.header('Access-Control-Allow-Origin', env.HOST_URL + ':' + env.HOST_PORT);
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type');
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    }

    app.use(allowCrossDomain);
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static(path.join(__dirname, '/../public')));
    // Put all API endpoints under '/api'
    app.post('/api/createRoom', (req, res) => {
      try {
        console.log(`Server: createRoom:  Room create requested with roomName:`, req.body.roomName);
        const roomName = req.body.roomName;
        const newRoomId = uid(10);
        if (roomName && roomName.replace(/ /g, '').length > 0) {
          store.get('chat_rooms', (err, reply) => {
            let rooms = [];
            if (reply) {
              rooms = JSON.parse(reply);
            }
            rooms.push({ roomId: newRoomId, roomName });
            store.set(`chat_room_${newRoomId}_users`, JSON.stringify([]))
            const messageId = uid(5);
            store.set(`chat_room_${newRoomId}_messages`, JSON.stringify([{ messageId, message: `Welcome to our party. To invite others ${env.HOST_URL}/room/${newRoomId} .` }]));
            store.set('chat_rooms', JSON.stringify(rooms));
          });
          console.log(`Server: createRoom:  Room created with:`, newRoomId, ' / ', req.body.roomName);
          res.send(JSON.stringify({ success: true, newRoomId, roomName }));
        } else {
          console.error('Server: createRoom: Empty roomName!');
          res.status(400).send('createRoom: Empty roomName!');
        }
      }
      catch (e) {
        console.error('Server: createRoom: Unexpected error:', JSON.stringify(e));
        res.status(500).send('createRoom: Unexpected error!');
      }
    });

    app.post('/api/connectRoom', (req, res) => {
      try {
        console.log(`Server: connectRoom: Connect requested with params:`, JSON.stringify(req.query));
        if (req.body.username && req.body.roomId) {
          const roomId = req.body.roomId;
          const username = req.body.username;
          store.get('chat_rooms', (err, reply) => {
            let rooms = [];
            if (reply) {
              rooms = JSON.parse(reply);
            }
            if (rooms.map(x => x.roomId).indexOf(roomId) !== -1) {
              store.get(`chat_room_${roomId}_users`, (err, reply) => {
                let users = []
                if (reply) {
                  users = JSON.parse(reply);
                }
                const roomName = rooms.filter(x => x.roomId === roomId)[0].roomName;
                const userId = uid(5);
                users.push({ username, userId });
                store.set(`chat_room_${roomId}_users`, JSON.stringify(users));
                console.log(`Server: connectRoom: Connected room ID / user ID :`, userId, ' / ', roomId);
                res.send(JSON.stringify({ success: true, username, userId, roomId, roomName }))
              })
            } else {
              console.error('Server: connectRoom: Room not exist! RoomId:', roomId);
              res.status(400).send('connectRoom: Room not exist!');
            }
          });
        } else {
          console.error('Server: connectRoom: Invalid Params!', JSON.stringify(req.body));
          res.status(400).send('connectRoom: Invalid Params!');
        }
      }
      catch (e) {
        console.error('connectRoom: Unexpected error:', JSON.stringify(e));
        res.status(500).send('connectRoom: Unexpected error!');
      }
    });

    app.post('/api/reConnectRoom', (req, res) => {
      try {
        console.log(`Server: reConnectRoom: Re-Connect requested with params:`, JSON.stringify(req.query));
        if (req.body.username && req.body.roomId) {
          const roomId = req.body.roomId;
          const userId = req.body.userId || uid(5);
          const username = req.body.username;
          store.get('chat_rooms', (err, reply) => {
            let rooms = [];
            if (reply) {
              rooms = JSON.parse(reply);
            }
            if (rooms.map(x => x.roomId).indexOf(roomId) !== -1) {
              const roomName = rooms.filter(x => x.roomId === roomId)[0].roomName;
              store.get(`chat_room_${roomId}_users`, (err, reply) => {
                let users = []
                if (reply) {
                  users = JSON.parse(reply);
                }
                if (users.map(x => x.userId).indexOf(userId) === -1) {
                  console.log('Server: reConnectRoom: User not exist, creating new user with username / user ID:', username, ' / ', userId);
                  users.push({ username, userId });
                  store.set(`chat_room_${roomId}_users`, JSON.stringify(users));
                }
                res.send(JSON.stringify({ success: true, username, userId, roomId, roomName }))
              })
            } else if (req.body.roomName) {
              const roomName = req.body.roomName;
              console.log('Server: reConnectRoom: room not exist, creating with params:', roomId, ' / ', roomName);
              console.log('Server: reConnectRoom: user not exist, creating with params:', username, ' / ', userId);
              rooms.push({ roomId, roomName });
              store.set(`chat_room_${roomId}_users`, JSON.stringify([{ username, userId }]));
              const messageId = uid(5);
              store.set(`chat_room_${roomId}_messages`, JSON.stringify([{ messageId, message: `Welcome to our party. To invite others ${env.HOST_URL}/room/${roomId} .` }]));
              store.set('chat_rooms', JSON.stringify(rooms));
              console.log('Server: reConnectRoom: Successfully re-connected with user ID / room ID / roomName:', userId, ' / ', roomId, ' / ', roomName);
              res.send(JSON.stringify({ success: true, username, userId, roomId, roomName }))
            } else {
              console.error('Server: reConnectRoom: Invalid Params!', JSON.stringify(req.body));
              res.status(400).send('reConnectRoom: Invalid Params!');
            }
          });
        } else {
          console.error('Server: reConnectRoom: Invalid Params!', JSON.stringify(req.body));
          res.status(400).send('reConnectRoom: Invalid Params!');
        }
      }
      catch (e) {
        console.error('Server: reConnectRoom: Unexpected error:', JSON.stringify(e));
        res.status(500).send('reConnectRoom: Unexpected error!');
      }
    });

    app.post('/api/sendMessage', (req, res) => {
      try {
        console.log(`Server: sendMessage: Send message requested with params: `, JSON.stringify(req.body));
        const username = req.body.username;
        const userId = req.body.userId;
        const roomId = req.body.roomId;
        const message = req.body.message;
        store.get('chat_rooms', (err, reply) => {
          let rooms = [];
          if (reply) {
            rooms = JSON.parse(reply);
          }
          if (rooms.map(x => x.roomId).indexOf(roomId) !== -1) {
            store.get(`chat_room_${roomId}_users`, (err, reply) => {
              let users = []
              if (reply) {
                users = JSON.parse(reply);
              }
              if (users.map(x => x.username).indexOf(username) !== -1) {
                store.get(`chat_room_${roomId}_messages`, (err, reply) => {
                  let messages = []
                  if (reply) {
                    messages = JSON.parse(reply);
                  }
                  const messageId = uid(5);
                  messages.push({ userId, username, message, messageId });
                  store.set(`chat_room_${roomId}_messages`, JSON.stringify(messages));
                  console.log('Server: sendMessage: Successfully sent message for room ID :', roomId);
                  res.send(JSON.stringify({ success: true, username, userId, roomId, message, messageId }))
                });
              } else {
                console.error('Server: sendMessage: User not exist! Username:', username);
                res.status(400).send('sendMessage: User not exist!');
              }
            });
          } else {
            console.error('Server: sendMessage: Room not exist! Room ID:', roomId);
            res.status(400).send('sendMessage: Room not exist!');
          }
        });
      }
      catch (e) {
        console.error('Server: sendMessage: Unexpected error:', JSON.stringify(e));
        res.status(500).send('sendMessage: Unexpected error!');
      }
    });

    app.post('/api/getMessages', (req, res) => {
      try {
        console.log(`Server: getMessages: Get messages requested with params:`, JSON.stringify(req.body));
        if (req.body.userId && req.body.roomId) {
          const roomId = req.body.roomId;
          const userId = req.body.userId;
          store.get('chat_rooms', (err, reply) => {
            let rooms = [];
            if (reply) {
              rooms = JSON.parse(reply);
            }
            if (rooms.map(x => x.roomId).indexOf(roomId) !== -1) {
              store.get(`chat_room_${roomId}_users`, (err, reply) => {
                let users = []
                if (reply) {
                  users = JSON.parse(reply);
                }
                if (users.map(x => x.userId).indexOf(userId) !== -1) {
                  store.get(`chat_room_${roomId}_messages`, (err, reply) => {
                    let messages = []
                    if (reply) {
                      messages = JSON.parse(reply);
                    }
                    console.log(`Server: getMessages: Successfully get all messages for Room ID:`, roomId);
                    res.send(JSON.stringify({ success: true, messages }))
                  });
                } else {
                  console.error('Server: getMessages: User not exist! user ID :', userId);
                  res.status(400).send('getMessages: User not exist!');
                }
              })
            } else {
              console.error('Server: getMessages: Room not exist! Room ID :', roomId);
              res.status(400).send('getMessages: Room not exist!');
            }
          });
        } else {
          console.error('Server: getMessages: Invalid Params!', JSON.stringify(req.body));
          res.status(400).send('getMessages: Invalid Params!');
        }
      }
      catch (e) {
        console.error('Server: getMessages: Unexpected error:', JSON.stringify(e));
        res.status(500).send('getMessages: Unexpected error!');
      }
    });

    app.post('/api/getUsers', (req, res) => {
      try {
        console.log(`Server: getUsers: Users requested with params:`, JSON.stringify(req.body));
        if (req.body.userId && req.body.roomId) {
          const roomId = req.body.roomId;
          const userId = req.body.userId;
          store.get('chat_rooms', (err, reply) => {
            let rooms = [];
            if (reply) {
              rooms = JSON.parse(reply);
            }
            if (rooms.map(x => x.roomId).indexOf(roomId) !== -1) {
              store.get(`chat_room_${roomId}_users`, (err, reply) => {
                let users = []
                if (reply) {
                  users = JSON.parse(reply);
                }
                if (users.map(x => x.userId).indexOf(userId) !== -1) {
                  console.log(`Server: getUsers: Successfully get all users for Room ID :`, roomId);
                  res.send(JSON.stringify({ success: true, users }))
                } else {
                  console.error('Server: getUsers: User not exist! User ID :', userId);
                  res.status(400).send('getUsers: User not exist!');
                }
              })
            } else {
              console.error('Server: getUsers: Room not exist! Room ID :', roomId);
              res.status(400).send('getUsers: Room not exist!');
            }
          });
        } else {
          console.error('Server: getUsers: Invalid Params!', JSON.stringify(req.body));
          res.status(400).send('getUsers: Invalid Params!');
        }
      }
      catch (e) {
        console.error('Server: getUsers: Unexpected error:', JSON.stringify(e));
        res.status(500).send('getUsers: Unexpected error!');
      }
    });

    // Host FE code:
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname + '/../public/index.html'));
    });

    const server = http.Server(app);
    const port = env.SERVER_PORT || 5000;
    server.listen(env.SERVER_PORT);
    console.log('Server: Listener started on port:', port);
    console.log('Server: Server is ready.');
    resolve(server);
  } catch (e) {
    console.log('Server: While starting serve Unexpected error occured:', e);
    reject(e);
  }
});

module.exports = { init }