const dbConfig = {
  // HOST: '',
  USER: 'demo',
  PASSWORD: 'demo',
  DB: 'demo',
  dialect: 'sqlite',
  storage: ':memory:',
  // pool: {
  //   max: 5,
  //   min: 0,
  //   acquire: 30000,
  //   idle: 10000
  // }
};

const Sequelize = require('sequelize');
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  // host: dbConfig.HOST,
  dialect: dbConfig.dialect,
  //storage: dbConfig.storage,
  storage: './database.sqlite',
  // pool: {
  //   max: dbConfig.pool.max,
  //   min: dbConfig.pool.min,
  //   acquire: dbConfig.pool.acquire,
  //   idle: dbConfig.pool.idle
  // },
  // define: {
  //   // timestamps: false, // disable createdAt and updatedAt fields
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