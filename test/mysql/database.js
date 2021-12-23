const Sequelize = require('sequelize');

// New sequelize instance
const sequelize = new Sequelize('mysql://demo:demo@localhost:3306/demo', {
  logging: false
});


const Room = require('./models/room.js')(sequelize, Sequelize.DataTypes);
const User = require('./models/user.js')(sequelize, Sequelize.DataTypes);

const connectDb = () => {
  return sequelize.authenticate().then(() => {
    return sequelize.sync({ force: true });
  });
};

const disconnectDb = () => {
  sequelize.close();
};

const models = { User, Room };

Room.associate(models);
User.associate(models);

module.exports = { models, connectDb, disconnectDb };