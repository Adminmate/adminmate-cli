export default (sequelize, Sequelize) => {
  const Users = sequelize.define('custom_users', {
    firstname: {
      type: Sequelize.STRING
    },
    lastname: {
      type: Sequelize.STRING
    },
    thumbnail: {
      type: Sequelize.STRING
    },
    birthdate: {
      type: Sequelize.DATE
    },
    rating: {
      type: Sequelize.INTEGER
    }
  }, {
    tableName: 'custom_users',
    schema: 'custom'
  });

  Users.associate = function(models) {
    Users.hasMany(models.CustomRoom, {
      foreignKey: 'userId',
      as: 'rooms'
    });
  }

  return Users;
};