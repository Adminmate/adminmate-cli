const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const RoomSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  thumbnail: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    country: String,
    zipCode: String,
    latitude: Number,
    longitude: Number
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

module.exports = mongoose.model('Room', RoomSchema, 'rooms');
