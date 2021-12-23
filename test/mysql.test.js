// see https://stackoverflow.com/questions/46227783/encoding-not-recognized-in-jest-js
require('mysql2/node_modules/iconv-lite').encodingExists('foo');
require('jest-specific-snapshot');
const fs = require('fs');
const { getDatabaseSchemas } = require('../helpers/database');
const { createAdminTemplate } = require('../helpers/generator');
const { getAllFiles } = require('./utils.js');

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

  // Project generation
  await createAdminTemplate(dialect, schemas, projectConfig, dbParams);

  // Check generated project
  const arrayOfFiles = getAllFiles('../test-mysql-adminmate-api');
  arrayOfFiles.forEach(file => {
    const fileName = file.split('-adminmate-api/')[1];
    const fileContent = fs.readFileSync(file, 'utf8');
    expect(fileContent).toMatchSpecificSnapshot(`./mysql/__snapshots__/${fileName}.shot`);
  });
});

// End tests ----------------------------------------------------------------------------

// Close sequelize connection
afterAll(async () => {
  await db.disconnectDb();
});