module.exports = (sequelize, Sequelize) => {
  const Reservations = sequelize.define('reservations', {
    price: {
      type: Sequelize.FLOAT
    },
    start_date: {
      type: Sequelize.DATE
    },
    end_date: {
      type: Sequelize.DATE
    },
    days_count: {
      type: Sequelize.INTEGER
    }
  }, {
    tableName: 'reservations'
  });

  Reservations.associate = function(models) {
    Reservations.belongsTo(models.users, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Reservations.belongsTo(models.rooms, {
      foreignKey: 'room_id',
      as: 'room'
    });
  }

  return Reservations;
};