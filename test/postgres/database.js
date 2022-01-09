const Sequelize = require('sequelize');

// New sequelize instance
const sequelize = new Sequelize('postgres://demo:demo@localhost:5432/demo', {
  logging: false
});

const Room = require('./models/room.js')(sequelize, Sequelize.DataTypes);
const User = require('./models/user.js')(sequelize, Sequelize.DataTypes);
const CustomRoom = require('./models/custom.room.js')(sequelize, Sequelize.DataTypes);
const CustomUser = require('./models/custom.user.js')(sequelize, Sequelize.DataTypes);

const connectDb = async () => {
  await sequelize.drop();
  await sequelize.createSchema('custom');
  return sequelize.sync({ force: true });
};

const disconnectDb = () => {
  sequelize.close();
};

const models = { User, Room, CustomUser, CustomRoom };

Room.associate(models);
User.associate(models);
CustomRoom.associate(models);
CustomUser.associate(models);

module.exports = { models, connectDb, disconnectDb };