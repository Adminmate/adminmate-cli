module.exports = (sequelize, Sequelize) => {
  const Rooms = sequelize.define('rooms', {
    main_image: {
      type: Sequelize.STRING,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING
    },
    price: {
      type: Sequelize.FLOAT
    },
    home_type: {
      type: Sequelize.ENUM,
      values: ['full', 'room']
    },
    room_type: {
      type: Sequelize.ENUM,
      values: ['simple', 'double']
    },
    total_occupancy: {
      type: Sequelize.INTEGER
    },
    total_bedrooms: {
      type: Sequelize.INTEGER
    },
    total_bathrooms: {
      type: Sequelize.INTEGER
    },
    summary: {
      type: Sequelize.STRING
    },
    address: {
      type: Sequelize.STRING
    },
    latitude: {
      type: Sequelize.FLOAT
    },
    longitude: {
      type: Sequelize.FLOAT
    },
    has_tv: {
      type: Sequelize.BOOLEAN
    },
    has_kitchen: {
      type: Sequelize.BOOLEAN
    },
    has_air_con: {
      type: Sequelize.BOOLEAN
    },
    has_heating: {
      type: Sequelize.BOOLEAN
    },
    has_internet: {
      type: Sequelize.BOOLEAN
    },
    is_validated: {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    },
    published_at: {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null
    }
  }, {
    tableName: 'rooms'
  });

  Rooms.associate = function(models) {
    Rooms.belongsTo(models.users, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Rooms.hasMany(models.reservations, {
      foreignKey: 'room_id',
      as: 'room'
    });
  }

  return Rooms;
};