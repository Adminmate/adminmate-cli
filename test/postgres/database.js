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
  // Disable foreign keys check
  // await sequelize.query(`SET session_replication_role = 'replica'`);
  // Drop everything
  // await sequelize.drop();
  // Re-enable foreign keys check
  // await sequelize.query(`SET session_replication_role = 'origin'`);

  // Create the custom schema and the whole database
  await sequelize.createSchema('custom').catch(e => {});
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