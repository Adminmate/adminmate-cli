// Connect to database
const { connectDb, models } = require('./database');
const faker = require('faker');

const getRandom = array => {
  return array[Math.floor(Math.random()*array.length)];
};

connectDb().then(async () => {
  console.log('MongoDB connected');

  await models.User.deleteMany({});
  console.log('Delete ok!');

  // Users ------------------------------------------------------------------------------

  let users = [];
  for (let i = 0; i < 100; i++) {
    const random = Math.round(Math.random() * (10 - 1) + 1);
    users.push({
      firstname: faker.name.firstName(),
      lastname: faker.name.lastName(),
      thumbnail: faker.internet.avatar(),
      birthdate: new Date('1990-05-14'),
      rating: random
    });
  }

  // Save users
  await models.User.insertMany(users);

  const usersList = await models.User.find();
  const usersIds = usersList.map(user => user._id);

  // Rooms ------------------------------------------------------------------------------

  let rooms = [];
  for (let i = 0; i < 100; i++) {
    rooms.push({
      title: faker.lorem.sentence(),
      price: faker.commerce.price(),
      thumbnail: faker.image.business(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        country: faker.address.country(),
        zipCode: faker.address.zipCode(),
        latitude: faker.address.latitude(),
        longitude: faker.address.longitude()
      },
      ownerId: getRandom(usersIds)
    });
  }

  // Save rooms
  await models.Room.insertMany(rooms);

  const roomsList = await models.Room.find();
  console.log('===roomsList', usersList[0], roomsList[0]);
});