// see https://stackoverflow.com/questions/46227783/encoding-not-recognized-in-jest-js
require('mysql2/node_modules/iconv-lite').encodingExists('foo');
require('jest-specific-snapshot');
const fs = require('fs');
const { getDatabaseSchemas } = require('../helpers/database');
const { createAdminTemplate } = require('../helpers/generator');
const { getAllFiles } = require('./utils.js');

const db = require('./postgres/database.js');

beforeAll(async () => {
  await db.connectDb().catch(e => {
    console.log(e);
  });
  await db.models.CustomUser.bulkCreate(require('./postgres/data/custom.users.js'));
  await db.models.CustomRoom.bulkCreate(require('./postgres/data/custom.rooms.js'));
});

// Tests --------------------------------------------------------------------------------

it('PostgreSQL to Sequelize schemas', async () => {
  const dbParams = {
    host: 'localhost',
    user: 'demo',
    password: 'demo',
    dbname: 'demo',
    port: 5432,
    schema: 'custom'
  };

  // Important
  global.use_local_cli = true;

  const dialect = 'postgresql';

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
  const arrayOfFiles = getAllFiles('../test-postgresql-adminmate-api');

  // Count number of files
  expect(arrayOfFiles.length).toBe(9);

  arrayOfFiles.forEach(file => {
    const fileName = file.split('-adminmate-api/')[1];
    const fileContent = fs.readFileSync(file, 'utf8');
    expect(fileContent).toMatchSpecificSnapshot(`./postgres/__snapshots__/${fileName}.shot`);
  });

  // Remove test directory
  fs.rmdirSync('../test-postgresql-adminmate-api', { recursive: true });
});

// End tests ----------------------------------------------------------------------------

// Close sequelize connection
afterAll(async () => {
  await db.disconnectDb();
});