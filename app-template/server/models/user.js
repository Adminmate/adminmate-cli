// const Car = require('./car');

module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define('users', {
    firstname: {
      type: Sequelize.STRING
    },
    lastname: {
      type: Sequelize.STRING
    },
    birthdate: {
      type: Sequelize.DATE
    },
    email_verified_at: {
      type: Sequelize.DATE
    },
    password: {
      type: Sequelize.STRING
    },
    description: {
      type: Sequelize.STRING
    },
    profile_image: {
      type: Sequelize.STRING
    },
    phone_number: {
      type: Sequelize.STRING
    }
  }, {
    tableName: 'users'
  });

  Users.associate = function(models) {
    Users.hasMany(models.reservations, {
      foreignKey: 'user_id',
      as: 'reservation'
    });
    Users.hasMany(models.rooms, {
      foreignKey: 'user_id',
      as: 'room'
    });
  }

  return Users;
};