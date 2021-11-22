import 'jest-specific-snapshot';
import { getDatabaseSchemas } from '../helpers/database';

describe('MongoDB', () => {
  it('MongoDB to Mongoose schema', async () => {
    const dbParams = {
      host: 'localhost',
      port: 27017,
      user: '',
      password: '',
      name: 'node-express-mongodb-server',
      ssl: false,
      srv: false
    };
    const schema = await getDatabaseSchemas('mongodb', dbParams);
    expect(schema).toMatchSpecificSnapshot('./__snapshots__/mongodb.shot');
  });
});