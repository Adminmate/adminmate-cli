const Sequelize = require('sequelize');

// New sequelize instance
const sequelize = new Sequelize('mysql://demo:demo@localhost:3306/demo', {
  logging: false
});

const Room = require('./models/room.js')(sequelize, Sequelize.DataTypes);
const User = require('./models/user.js')(sequelize, Sequelize.DataTypes);

const connectDb = async () => {
  // Disable foreign keys check
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
  // Force the drop of the cars model (from others tests)
  await sequelize.query('DROP TABLE IF EXISTS cars;');
  // Drop everything
  await sequelize.drop();
  // Re-enable foreign keys check
  await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
  // Sync database
  return sequelize.sync({ force: true });
};

const disconnectDb = () => {
  sequelize.close();
};

const models = { User, Room };

Room.associate(models);
User.associate(models);

module.exports = { models, connectDb, disconnectDb };