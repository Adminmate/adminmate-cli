export default (sequelize, Sequelize) => {
  const Users = sequelize.define('users', {
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
    tableName: 'users'
  });

  Users.associate = function(models) {
    // Users.hasMany(models.Room, {
    //   foreignKey: 'userId',
    //   as: 'rooms'
    // });
  }

  return Users;
};