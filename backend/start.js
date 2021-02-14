"use strict";
const chalk = require('chalk');
const redis = require('./redis');
const server = require('./server');
const socket = require('./socket');

const start = () => {
 redis.init().then((clients) => {
  server.init(clients.store).then((server) => {
   socket.init(server, clients.store, clients.pub, clients.sub).then((io) => {
    ['SIGINT', 'SIGTERM', 'exit'].forEach(event => {
     process.on(event, () => {
      console.log(chalk.yellowBright('Process: Server connection close please wait...'));
      server.destroy(() => {
       console.log(chalk.yellowBright('Process: Redis connection close please wait...'));
       setTimeout(() => redis.quit(clients, () => {
        console.log(chalk.yellowBright('Process: Exited gracefully.'));
        process.exit(0);
       }), 3000);
      });
     });
    });
    process.on('uncaughtException', e => {
     console.error(chalk.red('Process: Unhandled exception occurred. Process exiting:', e.message));
     process.kill(process.pid, "SIGINT");
    });
    console.log(chalk.yellowBright('Process: Everything is up'));

    setTimeout(() => io.wrong(), 3000);
   }).catch(e => {
    console.error(chalk.red('While starting socket error occurred:', e.message));
   });
  }).catch(e => {
   console.error(chalk.red('While starting server error occurred:', e.message));
  });
 }).catch(e => {
  console.error(chalk.red('While starting redis error occurred:', e.message));
 });
}

start();
