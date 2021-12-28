require('jest-specific-snapshot');
const fs = require('fs');
const { getDatabaseSchemas } = require('../helpers/database');
const { createAdminTemplate } = require('../helpers/generator');
const { getAllFiles } = require('./utils.js');

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

  // Project generation
  await createAdminTemplate(dialect, schemas, projectConfig, dbParams);

  // Check generated project
  const arrayOfFiles = getAllFiles('../test-mongodb-adminmate-api');

  // Count number of files
  expect(arrayOfFiles.length).toBe(8);

  arrayOfFiles.forEach(file => {
    const fileName = file.split('-adminmate-api/')[1];
    const fileContent = fs.readFileSync(file, 'utf8');
    expect(fileContent).toMatchSpecificSnapshot(`./mongodb/__snapshots__/${fileName}.shot`);
  });

  // Remove test directory
  fs.rmdirSync('../test-mongodb-adminmate-api', { recursive: true });
});

// End tests ----------------------------------------------------------------------------

// Close sequelize connection
afterAll(async () => {
  await db.disconnectDb();
});