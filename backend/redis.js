"use strict";
const chalk = require('chalk');
const redis = require('redis');
const creds = require('./creds.json');

const init = () => new Promise((resolve, reject) => {
 try {
  // Read credentials from JSON
  // For external redis setups set connection url from creds.url as
  // [redis:]//[[user][:password@]][host][:port][/db-number][?db=db-number[&password=bar[&option=value]]]
  const redisOptions = {
   url: creds.url,
   host: creds.host || '127.0.0.1',
   port: creds.port || 6379,
   socket_keepalive: true,
   retry_strategy: function (options) {
    if (options.error && options.error.code === 'ECONNREFUSED') {
     // End reconnecting on a specific error and flush all commands with
     // a individual error
     return new Error('The server refused the connection');
    }
    if (options.total_retry_time > 1000 * 60 * 60) {
     // End reconnecting after a specific timeout and flush all commands
     // with a individual error
     return new Error('Retry time exhausted');
    }
    if (options.attempt > 10) {
     // End reconnecting with built in error
     return undefined;
    }
    // Reconnect after
    return Math.min(options.attempt * 100, 3000);
   }
  }

  // Crete redis clients for store with pub and sub
  const store = redis.createClient(redisOptions);
  const pub = redis.createClient(redisOptions);
  const sub = redis.createClient(redisOptions);

  // Once ready
  store.once('ready', () => {
   // desired option to flush rooms on start
   // store.flushdb();

   console.log(chalk.green('Redis: Server is ready on :', redisOptions.host, ':', redisOptions.port));

   resolve({ store, pub, sub });
  });
 }
 catch (e) {
  console.error(chalk.red('Redis: While starting clients an error occurred:', e.message));
  reject(e);
 };
});


// Close clients
const quit = (clients, callback) => {
 clients.store.quit(() =>
  clients.pub.quit(() =>
    clients.sub.quit(callback)
  )
 );
}

module.exports = { init, quit }
