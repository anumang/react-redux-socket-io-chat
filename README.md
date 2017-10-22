# React-Redux Client Express-Soket-Redis Server Full Stack Chat Room App

Sample Full Stack Chat Room App with

 * [React] (https://facebook.github.io/react/) Client
 * [React-Redux] (https://github.com/reactjs/react-redux/) Client
 * [Redux-Socket-io] (https://github.com/itaylor/redux-socket.io/) Client Socket
 * [Babel] (https://babeljs.io/) ES6 Standards
 * [Eslint] (https://github.com/eslint/eslint/) ES6 & React Linter
 * [Webpack] (https://webpack.github.io/) Bundler
 * [Express] (https://github.com/expressjs/express/) Server
 * [Socket.io] (http://socket.io/) Server Socket
 * [Redis] (http://socket.io/) Store Pub Sub


Used third party tools:

 * [React-Alert] (https://github.com/schiehll/react-alert/) Alert Component
 * [React-Linkify] (https://github.com/tasti/react-linkify) Linkify Parser Component for chat box
 * [uid] (https://github.com/MatthewMueller/uid/) UID generator 

## Features

 1. Create private chat Room
 2. Share chat room with url
 3. Select username
 4. Join with shared url
 5. Re-Join on connection problems
 6. Inform with user actions (Join & Left)

## Screens
![react-redux-chat-screens](https://github.com/anumang/react-redux-socket-io-chat/blob/c8c9fa16d8f1bf83640e42e44a0eaf7ba7ac3a46/screenshots/screens.gif)

## Install
#### Requirements
 * [Node.Js] (https://nodejs.org/en/) >= 5.0
 * [Redis-Server] (https://redis.io/)

#### Clone & Install Node Modules
Run the following commands to install the app:
```
git clone https://github.com/anumang/react-redux-socket-io-chat.git
cd react-chat-app
npm install
```
#### Start Server
Run the following command to start API server:
```
npm run start-server
```
#### Check Redis Creds
You can customise redis creds. If you are using local redis server no need to modify.

If requires, make alterations on:

* `backend/creds.json`

```
{
 "host": "localhost",
 "port": 6379,
 "url": null
}
```
#### Serve app in production
After server is up. Run the following command to build bundle in production:
```
npm run build
```
App is running in production at [http://localhost:5000](http://localhost:5000)

#### Serve app in development
After server is up. Run the following commands to start webpack development server:
```
npm start
```
App is running in development at [http://localhost:8888](http://localhost:8888)
