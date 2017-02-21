const mongoose = require('mongoose');
const Promise = require('bluebird');
const CONN_STR = require('config').db;

mongoose.connect(CONN_STR, {
  server: {
    socketOptions: {
      keepAlive: 1
    }
  },
  promiseLibrary: Promise
});

mongoose.connection.once('connected', () => console.log('Connecting to mongoDB.........[ OK ]'));
mongoose.connection.on('error', err => console.log(`ERROR connecting to MongoDB.  ${err}`));
mongoose.connection.once('disconnected', () => console.log(`Mongoose disconnected from ${CONN_STR}`));

// If the Node process ends, close the Mongoose connection
// ===========================================================================
process.on('SIGINT', () => {
  mongoose.connection.close(() => {
    console.log('App has terminated! Connection to mongoDB closed.');
    process.exit(0);
  });
});

module.exports = mongoose;