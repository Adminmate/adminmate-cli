const mongoose = require('mongoose');

const User = require('./models/user');
const Room = require('./models/room');

const dbName = 'demo';
const connectionUrl = 'mongodb://localhost:27017/demo';

const connectDb = () => {
  return mongoose.connect(connectionUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

const disconnectDb = () => {
  return mongoose.connection.close();
};

const models = { User, Room };

module.exports = { models, connectDb, dbName, connectionUrl, disconnectDb };