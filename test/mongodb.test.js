require('jest-specific-snapshot');

const path = require('path');
const fs = require('fs');
const { getDatabaseSchemas } = require('../helpers/database');
const { createAdminTemplate } = require('../helpers/generator');
const { getAllFiles } = require('./utils.js');

// Make the appRoot path available everywhere
global.appRoot = path.resolve(__dirname).replace('/test', '');

const db = require('./mongodb/database.js');

const cleanDemoDatabase = () => {
  return new Promise((resolve, reject) => {
    const MongoClient = require('mongodb').MongoClient;
    const dbName = db.dbName;
    const client = new MongoClient(db.connectionUrl);

    client
      .connect()
      .then(client => client.db(dbName).listCollections().toArray())
      .then(async cols => {
        // Drop all models
        const _drops = await Promise.all(cols.map(col => {
          return client.db(dbName).collection(col.name).drop();
        }));

        // Close connection
        client.close();

        // Resolve when cleaning is finished
        resolve();
      });
  });
};

beforeAll(async () => {
  // Clean demo database
  await cleanDemoDatabase();

  // Create demo models
  await db.connectDb().catch(e => {
    console.log(e);
  });

  // Delete all entries from models
  await db.models.User.deleteMany({});
  await db.models.Room.deleteMany({});

  // Save users
  await db.models.User.insertMany(require('./mongodb/data/users.js'));
  const usersDB = await db.models.User.findOne().lean();
  const roomsList = require('./mongodb/data/rooms.js');
  roomsList.forEach(room => {
    room.userId = usersDB._id;
  });

  // Save rooms
  await db.models.Room.insertMany(roomsList);
});

// Tests --------------------------------------------------------------------------------

it('MongoDB to Mongoose schemas', async () => {
  const dbParams = {
    host: 'localhost',
    port: 27017,
    user: '',
    password: '',
    dbname: 'demo',
    ssl: false,
    srv: false
  };

  // Important
  global.use_local_cli = true;

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
  const cleanFiles = arrayOfFiles.map(file => {
    return file.split('test-mongodb-adminmate-api/')[1]
  });
  expect(cleanFiles).toEqual([
    '.env',
    '.gitignore',
    'config/adminmate.js',
    'database.js',
    'models/rooms.js',
    'models/users.js',
    'package.json',
    'server.js'
  ]);

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