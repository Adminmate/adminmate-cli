import fs from 'fs';
import mkdirp from 'mkdirp';
import 'jest-specific-snapshot';
import { getDatabaseSchemas } from '../../helpers/database';
import { createAdminTemplate } from '../../helpers/generator';

// Reset console log
console.log = () => {};

describe('MySQL', () => {
  it('MySQL to Sequelize schemas', async () => {
    const dbParams = {
      host: 'localhost',
      user: 'demo',
      password: 'demo',
      name: 'demo',
      port: 3306
    };
    const schemas = await getDatabaseSchemas('mysql', dbParams);

    const projectConfig = {
      name: 'test-mysql',
      id: 'id',
      sk: 'sk',
      master_password: 'master_password'
    };

    // Mock the fs.writeFileSync function
    jest.spyOn(fs, 'writeFileSync').mockImplementation(() => {});
    jest.spyOn(fs, 'copyFileSync').mockImplementation(() => {});
    jest.spyOn(mkdirp, 'sync').mockImplementation(() => {});

    // Project generation
    await createAdminTemplate('mysql', schemas, projectConfig, dbParams);

    expect(fs.writeFileSync).toBeCalledTimes(7);
    fs.writeFileSync.mock.calls.forEach(call => {
      const fileName = call[0].split('-adminmate-api/')[1];
      const fileContent = call[1];
      expect(fileContent).toMatchSpecificSnapshot(`../__snapshots__/mysql/${fileName}.shot`);
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
});