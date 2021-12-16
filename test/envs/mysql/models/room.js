export default (sequelize, Sequelize) => {
  const Rooms = sequelize.define('rooms', {
    title: {
      type: Sequelize.STRING
    },
    price: {
      type: Sequelize.INTEGER
    },
    thumbnail: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.JSON
    }
  }, {
    tableName: 'rooms'
  });

  Rooms.associate = function(models) {
    Rooms.belongsTo(models.User, {
      foreignKey: 'ownerId',
      as: 'user'
    });
  }

  return Rooms;
};