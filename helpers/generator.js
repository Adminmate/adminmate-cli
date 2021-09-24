import fs from 'fs';
import mkdirp from 'mkdirp';
import slugify from 'slugify';

import handlebars from './handlebars.js';

export async function createAdminTemplate(projectName, database) {
  await createTemplateStructure(projectName);

  console.log('ok!!!!!!!!!!!!');
};

const createTemplateStructure = (projectName) => {
  return new Promise(async (resolve, reject) => {
    const cwd = process.cwd();
    const projectPath = `${cwd}/${projectName}`;

    // Remove generated dir - for dev only
    // fs.rmdirSync(`${projectPath}`, { recursive: true });

    await mkdirp(`${projectPath}/server`);
    await mkdirp(`${projectPath}/server/config`);
    await mkdirp(`${projectPath}/server/controllers`);
    await mkdirp(`${projectPath}/server/middlewares`);
    await mkdirp(`${projectPath}/server/models`);

    // createFile(`${projectPath}/package.json`, 'test');

    createServerJsFile(projectPath);
    createDatabaseFile(projectPath);
    createPackageJsonFile(projectName, projectPath);

    resolve();
  });
};

const createPackageJsonFile = (projectName, projectPath) => {
  const projectSlug = slugify(projectName);

  const packageJson = `
{
  "name": "${projectSlug}-adminmate-mongodb",
  "version": "1.0.0",
  "private": false,
  "scripts": {
    "start": "node ./server.js",
  },
  "dependencies": {
    "@hapi/joi": "^17.1.1",
    "adminmate-express-mongoose": "^1.1.11",
    "axios": "^0.18.0",
    "bcrypt": "^4.0.1",
    "browser-sync": "^2.26.5",
    "cookie-parser": "^1.4.4",
    "cors": "^2.8.5",
    "express": "^4.16.4",
    "faker": "^5.4.0",
    "formidable": "1.1.x",
    "gulp-nodemon": "^2.4.2",
    "lodash": "^4.17.11",
    "moment": "^2.24.0",
    "moment-timezone": "^0.5.27",
    "mongoose": "^5.9.7",
    "natives": "^1.1.6",
    "promise": "^8.0.3",
    "sitemap": "^5.1.0",
    "slack-notify": "^0.1.7",
    "slugify": "^1.4.5",
    "uuid": "3.3.x"
  }
}`;

  createFile(`${projectPath}/package.json`, packageJson);
};

const createDatabaseFile = (projectPath) => {
  const cwd = process.cwd();

  fs.copyFileSync(`${cwd}/app-template/server/database-mongoose.js`, `${projectPath}/server/database.js`);
};

const createServerJsFile = (projectPath) => {
  const cwd = process.cwd();

  const serverJsContent = fs.readFileSync(`${cwd}/app-template/server.hbs`, 'utf8');
  const serverJsTemplate = handlebars.compile(serverJsContent);
  const result = serverJsTemplate({ database: 'mongodb' });

  createFile(`${projectPath}/server.js`, result);
};

const createFile = (filePath, content) => {
  if (fs.existsSync(filePath)) {
    console.log('This file already exist.')
    return;
  }

  fs.writeFileSync(filePath, content);
};