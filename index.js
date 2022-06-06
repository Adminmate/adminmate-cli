#!/usr/bin/env node

const path = require('path');
const _ = require('lodash');
const commander = require('commander');
const inquirer = require('inquirer');
const figlet = require('figlet');
const Spinnies = require('spinnies');
const axios = require('axios');
const cliColor = require('cli-color');

const questions = require('./config/questions.js');
const templateGenerator = require('./helpers/generator.js');
const dbHelper = require('./helpers/database.js');
const generalHelper = require('./helpers/general.js');
const config = require('./config/config');

// Make the appRoot path available everywhere
global.appRoot = path.resolve(__dirname);

// Reset console.log
console.log = () => {};

figlet('Adminmate', function(err, data) {
  console.log('');
  console.log(data);

  // Launch command line program
  commandLine();
});

const checkReqValidity = params => {
  return new Promise(async (resolve, reject) => {
    await generalHelper.timeout(2000);
    axios({
      method: 'POST',
      url: `${global.config.apiUrl}/cli/check_auth`,
      data: {
        project_id: params.id,
        cli_token: params.hash
      }
    })
    .then(() => {
      resolve('ok');
    })
    .catch(e => {
      reject();
    });
  });
};

const validateStep = (params, step) => {
  return axios({
    method: 'POST',
    url: `${global.config.apiUrl}/cli/validate_step`,
    data: {
      project_id: params.id,
      cli_token: params.hash,
      step
    }
  })
  .catch(() => {});
};

const getDatabaseCredentialsQuestions = db => {
  switch (db) {
    case 'mongodb':
      return questions.mongodb;
    case 'mysql':
      return questions.mysql;
    case 'postgresql':
      return questions.postgresql;
    // case 'sqlite':
    //   return [];
  }
};

const installBox = projectSlug => {
  const spaces = [...Array(44-projectSlug.length).keys()].map(() => '').join(' ');

  console.debug('');
  console.debug('   ┌──────────────────────────────────────────────────────────────────────────┐');
  console.debug('   │                                                                          │');
  console.debug(`   │   1. Type the following commands to finalize the installation process:   │`);
  console.debug('   │                                                                          │');
  console.debug(`   │    - ${cliColor.cyan(`cd ${projectSlug}`)}${spaces}                      │`);
  console.debug(`   │    - ${cliColor.cyan('npm i && npm start')}                                                  │`);
  console.debug('   │                                                                          │');
  console.debug('   │   2. Go back to the installation web app                                 │')
  console.debug('   │                                                                          │');
  console.debug('   └──────────────────────────────────────────────────────────────────────────┘');
  console.debug('');
};

const commandLine = () => {
  commander
    .usage('[options] <file>')
    .requiredOption('--name <name>', 'use project name')
    .requiredOption('--id <id>', 'use project id')
    .requiredOption('--sk <sk>', 'use secret key')
    .requiredOption('--hash <hash>', 'use hash')
    .option('--db <database>', 'use database')
    .option('--host <host>', 'use host')
    .option('--port <port>', 'use port')
    .option('--user <user>', 'use user')
    .option('--password <password>', 'use password')
    .option('--dbname <dbname>', 'use dbname')
    .option('--schema <schema>', 'use schema')
    .option('--env <env>', 'use env')
    .action(async (params, options) => {
      const cwd = process.cwd();

      // Set default env to production
      global.env = params.env || 'production';
      global.config = config(global.env) || config('production');
      global.use_local_cli = cwd.endsWith('/adminmate-cli') === true;

      // Init spinnies
      const spinnies = new Spinnies();

      // Check request validity ---------------------------------------------------------

      spinnies.add('spinner-req-validity', { text: 'Checking request validity...', color: 'white', succeedColor: 'white' });
      const authReq = await checkReqValidity(params).catch(() => {})

      if (!authReq) {
        spinnies.fail('spinner-req-validity', { text: 'Your cli request is invalid' });
        return;
      }

      await validateStep(params, 'launch_cli');
      spinnies.succeed('spinner-req-validity');

      // Check missing params -----------------------------------------------------------

      // If the database is not setted we ask for it
      if (!params.db || !['mysql', 'postgresql', 'sqlite', 'mongodb'].includes(params.db)) {
        const databaseData = await inquirer.prompt([questions.database]);
        params.db = databaseData.database;
      }

      // Ask for the database creddentials ----------------------------------------------

      // Ask for the mission credentials & connection infos
      // Just ask for the missing infos thanks to the second parameter
      const databaseQuestions = getDatabaseCredentialsQuestions(params.db);
      const databaseExistingAnswers = _.omit(params, ['name', 'id', 'sk', 'hash', 'db']);
      const databaseCredentials = await inquirer.prompt(databaseQuestions, databaseExistingAnswers);

      // Connect to the database --------------------------------------------------------

      // Loading...
      spinnies.add('spinner-connecting', { text: 'Connecting to the database...', color: 'white', succeedColor: 'white' });

      const schemas = await dbHelper.getDatabaseSchemas(params.db, databaseCredentials)
        .catch(err => {
          spinnies.fail('spinner-connecting', { text: `Failed to connect to the database: ${err}` });
        });

      if (!schemas) {
        return;
      }

      if (schemas.length === 0) {
        spinnies.fail('spinner-connecting', { text: `There is no collection in your ${params.db} database` });
        return;
      }

      await validateStep(params, 'database');
      spinnies.succeed('spinner-connecting');

      // Ask for last details -----------------------------------------------------------

      const generalAnswers = {};
      if (global.env === 'development') {
        generalAnswers.master_password = 'master_password';
      }

      const projectDetails = await inquirer.prompt(questions.general, generalAnswers);
      const projectConfig = { ...params, ...projectDetails };
      await validateStep(params, 'master_password');

      // Generate project template ------------------------------------------------------

      spinnies.add('spinner-generating', { text: 'Generating the project structure...', color: 'white', succeedColor: 'white' });

      await generalHelper.timeout(2000);
      const directoryName = await templateGenerator.createAdminTemplate(params.db, schemas, projectConfig, databaseCredentials);

      spinnies.succeed('spinner-generating');
      await validateStep(params, 'generation');

      // Success messages ---------------------------------------------------------------

      console.debug('');
      spinnies.add('spinner-success-1', { text: 'Your project has been successfully generated!' });
      spinnies.succeed('spinner-success-1');

      // Final steps
      installBox(directoryName);
    })
    .parse(process.argv);
};