const mongoose = require('mongoose');

const User = require('./models/user');
const Room = require('./models/room');

const connectDb = () => {
  return mongoose.connect('mongodb://localhost:27017/demo', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
};

const disconnectDb = () => {
  return mongoose.connection.close();
};

const models = { User, Room };

module.exports = { models, connectDb, disconnectDb };