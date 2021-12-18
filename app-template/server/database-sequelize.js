const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.AM_DB_URL, {
  pool: {
    minConnections: 1,
    maxConnections: 5
  },
  logging: false
  // storage: './database.sqlite',
  // define: {
  //   timestamps: false, // disable createdAt and updatedAt fields
  //   freezeTableName: true // no table name auto-pluralization
  // }
});

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

const models = require('./models/init-models')(sequelize);

module.exports = { models, db };