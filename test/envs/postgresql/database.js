import Sequelize from 'sequelize';

// New sequelize instance
const sequelize = new Sequelize('postgres://demo:demo@localhost:5432/demo', {
  logging: false
});

// sequelize.createSchema('custom').then(() => {
//   console.log('schema ok');
// })

import RoomModel from './models/room.js';
import UserModel from './models/user.js';
import CustomRoomModel from './models/custom.room.js';
import CustomUserModel from './models/custom.user.js';

const Room = RoomModel(sequelize, Sequelize.DataTypes);
const User = UserModel(sequelize, Sequelize.DataTypes);
const CustomRoom = CustomRoomModel(sequelize, Sequelize.DataTypes);
const CustomUser = CustomUserModel(sequelize, Sequelize.DataTypes);

const connectDb = () => {
  return sequelize.authenticate().then(() => {
    return sequelize.sync({ force: true });
  });
};

const models = { User, Room, CustomUser, CustomRoom };

Room.associate(models);
User.associate(models);
CustomRoom.associate(models);
CustomUser.associate(models);

export { models, connectDb };