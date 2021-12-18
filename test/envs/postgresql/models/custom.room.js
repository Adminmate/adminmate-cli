export default (sequelize, Sequelize) => {
  const Rooms = sequelize.define('custom_rooms', {
    title: {
      type: Sequelize.STRING
    },
    price: {
      type: Sequelize.DECIMAL(10, 2)
    },
    thumbnail: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.JSON
    }
  }, {
    tableName: 'custom_rooms',
    schema: 'custom'
  });

  Rooms.associate = function(models) {
    Rooms.belongsTo(models.CustomUser, {
      foreignKey: 'userId',
      as: 'user'
    });
  }

  return Rooms;
};