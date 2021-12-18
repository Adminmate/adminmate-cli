// Connect to database
import { connectDb, models } from './database.js';
import faker from 'faker';

const getRandom = array => {
  return array[Math.floor(Math.random()*array.length)];
};

connectDb().then(async () => {
  console.log('PostgreSQL connected');

  await models.Room.destroy({ where: {}, /*truncate: true, cascade: false*/ })
    .catch(e => console.log('error', e));
  await models.User.destroy({ where: {}, /*truncate: true, cascade: false*/ })
    .catch(e => console.log('error', e));
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
  await models.User.bulkCreate(users)
    .catch(e => console.log('error', e));

  await models.CustomUser.bulkCreate(users)
    .catch(e => console.log('error', e));

  const usersList = await models.User.findAll({ where: {} })
    .catch(e => console.log('error', e));
  const usersIds = usersList.map(user => user.id);

  // Rooms ------------------------------------------------------------------------------

  let rooms = [];
  for (let i = 0; i < 100; i++) {
    rooms.push({
      title: faker.lorem.sentence(),
      price: parseFloat(faker.commerce.price()),
      thumbnail: faker.image.business(),
      address: {
        street: faker.address.streetName(),
        city: faker.address.city(),
        country: faker.address.country(),
        zipCode: faker.address.zipCode(),
        latitude: faker.address.latitude(),
        longitude: faker.address.longitude()
      },
      userId: getRandom(usersIds)
    });
  }

  // Save rooms
  await models.Room.bulkCreate(rooms)
    .catch(e => console.log('error', e));

  await models.CustomRoom.bulkCreate(rooms)
    .catch(e => console.log('error', e));

  const roomsList = await models.Room.findAll({ where: {} })
    .catch(e => console.log('error', e));
  console.log('===roomsList', usersList.length, roomsList.length);
});