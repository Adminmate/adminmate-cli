import Sequelize from 'sequelize';

// New sequelize instance
const sequelize = new Sequelize('mysql://demo:demo@localhost:3306/demo', {
  logging: false
});

import RoomModel from './models/room.js';
import UserModel from './models/user.js';

const Room = RoomModel(sequelize, Sequelize.DataTypes);
const User = UserModel(sequelize, Sequelize.DataTypes);

const connectDb = () => {
  return sequelize.authenticate().then(() => {
    return sequelize.sync({ force: false });
  });
};

const models = { User, Room };

Room.associate(models);
User.associate(models);

export { models, connectDb };