const fs = require('fs');
const mkdirp = require('mkdirp');
const slugify = require('slugify');
const appRoot = require('app-root-path');

const handlebars = require('./handlebars.js');
const generalHelper = require('./general.js');
const dbHelper = require('./database.js');

const databaseTemplates = {
  mongodb: 'mongoose',
  mysql: 'sequelize',
  postgresql: 'sequelize',
  mariadb: 'sequelize'
};

const databasePackages = {
  mongodb: '"adminmate-express-mongoose": "^1.3.0"',
  mysql: '"adminmate-express-sequelize": "^1.1.0"',
  postgresql: '"adminmate-express-sequelize": "^1.1.0"',
  mariadb: '"adminmate-express-sequelize": "^1.1.0"'
};

const createAdminTemplate = async (databaseType, models, generalParams, dbParams) => {
  return new Promise(async (resolve, reject) => {
    const projectName = generalParams.name;
    const cwd = process.cwd();
    const targetDir = global.use_local_cli ? cwd.replace('/adminmate-cli', '') : cwd;
    const projectSlug = `${slugify(projectName).toLocaleLowerCase()}-adminmate-api`;
    const projectPath = `${targetDir}/${projectSlug}`;

    // Remove generated dir - for dev only
    if (global.use_local_cli) {
      fs.rmdirSync(`${projectPath}`, { recursive: true });
    }

    // Create directories
    mkdirp.sync(`${projectPath}/config`);
    mkdirp.sync(`${projectPath}/controllers`);
    mkdirp.sync(`${projectPath}/middlewares`);
    mkdirp.sync(`${projectPath}/models`);

    createServerJsFile(projectPath, databaseType);
    createDatabaseFile(projectPath, databaseType);
    createPackageJsonFile(projectPath, projectName, databaseType);
    createDotEnvFile(projectPath, generalParams, dbParams, databaseType, global.use_local_cli);
    createGitIgnoreFile(projectPath);

    models.forEach(model => {
      createModelFile(projectPath, databaseType, model);
    });

    createAmConfigFile(projectPath, models);

    resolve(projectSlug);
  });
};

const createDotEnvFile = (projectPath, generalParams, dbParams, database, useLocalCli) => {
  const amDbUrl = database === 'mongodb' ?
    dbHelper.getMongodbConnectionUrl(dbParams) :
    dbHelper.getSQLConnectionUrl(database, dbParams);

  const fileContent = `// IMPORTANT: This file should be removed from production env

AM_PROJECT_ID=${generalParams.id}
AM_SECRET_KEY=${generalParams.sk}
AM_AUTH_KEY=${useLocalCli ? 'auth_key' : generalHelper.randomString(64)}
AM_MASTER_PWD=${generalParams.master_password}
AM_DB_URL=${amDbUrl}
`;

  createFile(`${projectPath}/.env`, fileContent);
};

const createGitIgnoreFile = (projectPath) => {
  const fileContent = `node_modules
.env
.DS_Store
`;

  createFile(`${projectPath}/.gitignore`, fileContent);
};

const createAmConfigFile = (projectPath, models) => {
  const tplContent = fs.readFileSync(`${appRoot.path}/app-template/config/adminmate.hbs`, 'utf8');
  const compiledTplContent = handlebars.compile(tplContent);
  const result = compiledTplContent({ models });

  createFile(`${projectPath}/config/adminmate.js`, result);
};

const createModelFile = (projectPath, database, model) => {
  if (['mysql', 'sqlite', 'postgresql'].includes(database)) {
    const schemaContent = `// This model was generated by the adminmate-cli. You are free to adapt it ;)\n\n${model.schema}`;

    // Write file
    createFile(`${projectPath}/models/${model.collection}.js`, schemaContent);
  }
  else if (database === 'mongodb') {
    const tplContent = fs.readFileSync(`${appRoot.path}/app-template/models/schema-mongoose.hbs`, 'utf8');
    const compiledTplContent = handlebars.compile(tplContent);
    const result = compiledTplContent({
      modelName: model.collection,
      jsonSchema: model.schema
    });

    // Write file
    createFile(`${projectPath}/models/${model.collection}.js`, result);
  }
};

const createPackageJsonFile = (projectPath, projectName, database) => {
  const projectSlug = slugify(projectName).toLocaleLowerCase();
  const ormNpmPackage = databasePackages[database];

  let extraPackages = '';
  if (database === 'mysql') {
    extraPackages = `"mysql2": "^2.3.3"`;
  }
  else if (database === 'postgresql') {
    extraPackages = `"pg": "^8.7.1"`;
  }

  const packageJson = `
{
  "name": "${projectSlug}-adminmate-${database}",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node ./server.js"
  },
  "dependencies": {
    ${ormNpmPackage},
    "dotenv": "^10.0.0",
    "express": "~4.17.2"${extraPackages ? ',' : ''}
    ${extraPackages}
  }
}`;

  createFile(`${projectPath}/package.json`, packageJson);
};

const createDatabaseFile = (projectPath, database) => {
  if (['mysql', 'postgresql', 'sqlite'].includes(database)) {
    let tplContent = fs.readFileSync(`${appRoot.path}/models-tmp/init-models.js`, 'utf8');
    tplContent = tplContent.replace(/var/g, 'const');
    createFile(`${projectPath}/models/init-models.js`, tplContent);

    // Remove tmp dir generated by sequelize-auto
    fs.rmdirSync(`${appRoot.path}/models-tmp`, { recursive: true });
  }
  fs.copyFileSync(`${appRoot.path}/app-template/database-${databaseTemplates[database]}.js`, `${projectPath}/database.js`);
};

const createServerJsFile = (projectPath, databaseType) => {
  const serverJsContent = fs.readFileSync(`${appRoot.path}/app-template/server.hbs`, 'utf8');
  const serverJsTemplate = handlebars.compile(serverJsContent);
  const result = serverJsTemplate({ database: databaseType });

  createFile(`${projectPath}/server.js`, result);
};

const createFile = (filePath, content) => {
  if (fs.existsSync(filePath)) {
    console.log('This file already exist.')
    return;
  }

  fs.writeFileSync(filePath, content);
};

module.exports.createAdminTemplate = createAdminTemplate;
