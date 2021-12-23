require('jest-specific-snapshot');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { getDatabaseSchemas } = require('../helpers/database');
const { createAdminTemplate } = require('../helpers/generator');

const db = require('./mongodb/database.js');

beforeAll(async () => {
  await db.connectDb()
    .then(async () => {
      await db.models.User.insertMany(require('./mongodb/data/users.js'));
      const usersDB = await db.models.User.findOne().lean();
      const roomsList = require('./mongodb/data/rooms.js');
      roomsList.forEach(room => {
        room.userId = usersDB._id;
      });
      await db.models.Room.insertMany(roomsList);
    });
});

// Tests --------------------------------------------------------------------------------

it('MongoDB to Sequelize schemas', async () => {
  const dbParams = {
    host: 'localhost',
    port: 27017,
    user: '',
    password: '',
    name: 'demo',
    ssl: false,
    srv: false
  };

  const dialect = 'mongodb';

  const schemas = await getDatabaseSchemas(dialect, dbParams);

  const projectConfig = {
    name: `test-${dialect}`,
    id: 'id',
    sk: 'sk',
    master_password: 'master_password'
  };

  // Mock the fs.writeFileSync function
  jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
  jest.spyOn(fs, 'copyFileSync').mockImplementation(() => {});
  jest.spyOn(mkdirp, 'sync').mockImplementation(() => {});

  // Project generation
  await createAdminTemplate(dialect, schemas, projectConfig, dbParams);

  expect(fs.writeFileSync).toBeCalledTimes(7);
  fs.writeFileSync.mock.calls.forEach(call => {
    const fileName = call[0].split('-adminmate-api/')[1];
    const fileContent = call[1];
    expect(fileContent).toMatchSpecificSnapshot(`./mongodb/__snapshots__/${fileName}.shot`);
  });

  // Directories creation
  const newDirsToBeCreated = [
    'server',
    'server/config',
    'server/controllers',
    'server/middlewares',
    'server/models'
  ];

  const newDirs = mkdirp.sync.mock.calls.map(call => {
    return call[0].split('-adminmate-api/')[1];
  });

  expect(newDirsToBeCreated).toMatchObject(newDirs);

  // Files copies
  expect(fs.copyFileSync).toBeCalledTimes(1);
  expect(fs.copyFileSync.mock.calls[0][0]).toContain('/database-mongoose.js');
  expect(fs.copyFileSync.mock.calls[0][1]).toContain('/database.js');
});

// End tests ----------------------------------------------------------------------------

// Close sequelize connection
afterAll(async () => {
  await db.disconnectDb();
});