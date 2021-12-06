const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.AM_DB_URL, {
  pool: {
    minConnections: 1,
    maxConnections: 5
  },
  // storage: './database.sqlite',
  // define: {
  //   timestamps: false, // disable createdAt and updatedAt fields
  //   freezeTableName: true // no table name auto-pluralization
  // }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

const models = {};
const normalizedPath = require('path').join(__dirname, 'models');

require('fs').readdirSync(normalizedPath).forEach(file => {
  const modelName = file.replace('.js', '');
  models[modelName] = require(`./models/${file}`)(sequelize, Sequelize);
});

module.exports = { models, db };