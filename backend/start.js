"use strict";
const redis = require('./redis');
const server = require('./server');
const socket = require('./socket');

const start = () => {
 redis.init().then((clients) => {
  server.init(clients.store).then((server) => {
   socket.init(server, clients.store, clients.pub, clients.sub).then(() => {
    process.on("exit", function () {
     server.close();
     redis.quit(clients);
     console.log('Exit!');
    });
    console.log('Everything is up.');
   }).catch(e => {
    console.error('While starting socket error occured:', JSON.stringify(e));
   });
  }).catch(e => {
   console.error('While starting server error occured:', JSON.stringify(e));
  });
 }).catch(e => {
  console.error('While starting redis error occured:', JSON.stringify(e));
 });
}

start();