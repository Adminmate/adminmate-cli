import 'jest-specific-snapshot';
import { getDatabaseSchemas } from '../helpers/database';

describe('MySQL', () => {
  it('MySQL to Sequelize schema', async () => {
    const dbParams = {
      host: 'localhost',
      user: 'demo',
      password: 'demo',
      name: 'db'
    };
    const schema = await getDatabaseSchemas('mysql', dbParams);
    expect(schema).toMatchSpecificSnapshot('./__snapshots__/mysql.shot');
  });
});