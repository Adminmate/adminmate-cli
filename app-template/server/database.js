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

db.users = require('./models/user.js')(sequelize, Sequelize);
db.rooms = require('./models/room.js')(sequelize, Sequelize);
db.reservations = require('./models/reservation.js')(sequelize, Sequelize);

db.users.associate(db);
db.rooms.associate(db);
db.reservations.associate(db);

module.exports = db;