// see https://stackoverflow.com/questions/46227783/encoding-not-recognized-in-jest-js
require('mysql2/node_modules/iconv-lite').encodingExists('foo');
require('jest-specific-snapshot');
const fs = require('fs');
const mkdirp = require('mkdirp');
const { getDatabaseSchemas } = require('../helpers/database');
const { createAdminTemplate } = require('../helpers/generator');

const db = require('./mysql/database.js');

beforeAll(async () => {
  await db.connectDb()
    .then(async () => {
      await db.models.User.bulkCreate(require('./mysql/data/users.js'));
      await db.models.Room.bulkCreate(require('./mysql/data/rooms.js'));
    });
});

// Tests --------------------------------------------------------------------------------

it('MySQL to Sequelize schemas', async () => {
  const dbParams = {
    host: 'localhost',
    user: 'demo',
    password: 'demo',
    name: 'demo',
    port: 3306
  };

  const dialect = 'mysql';

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

  expect(fs.writeFileSync).toBeCalledTimes(8);
  fs.writeFileSync.mock.calls.forEach(call => {
    const fileName = call[0].split('-adminmate-api/')[1];
    const fileContent = call[1];
    expect(fileContent).toMatchSpecificSnapshot(`./mysql/__snapshots__/${fileName}.shot`);
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
  expect(fs.copyFileSync.mock.calls[0][0]).toContain('/database-sequelize.js');
  expect(fs.copyFileSync.mock.calls[0][1]).toContain('/database.js');
});

// End tests ----------------------------------------------------------------------------

// Close sequelize connection
afterAll(async () => {
  await db.disconnectDb();
});