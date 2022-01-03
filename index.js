#!/usr/bin/env node

const commander = require('commander');
const inquirer = require('inquirer');
const figlet = require('figlet');
const Spinnies = require('spinnies');
const axios = require('axios');

const questions = require('./config/questions.js');
const templateGenerator = require('./helpers/generator.js');
const dbHelper = require('./helpers/database.js');
const generalHelper = require('./helpers/general.js');

// Reset console.log
console.log = () => {};

const cwd = process.cwd();
const IS_PROD = !cwd.endsWith('/adminmate-cli');
const API_URL = IS_PROD ? 'https://api.adminmate.io' : 'http://localhost:3010';

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
      url: `${API_URL}/cli/check_auth`,
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
    url: `${API_URL}/cli/validate_step`,
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
    case 'sqlite':
      return [];
  }
};

const commandLine = () => {
  commander
    .usage('[options] <file>')
    .requiredOption('--name <name>', 'use project name')
    .requiredOption('--id <id>', 'use project id')
    .requiredOption('--sk <sk>', 'use secret key')
    .requiredOption('--hash <hash>', 'use hash')
    .option('--db <database>', 'use database')
    .action(async (params, options) => {

      // Init spinnies
      const spinnies = new Spinnies();

      // console.log(params);

      // Check request validity ---------------------------------------------------------

      spinnies.add('spinner-req-validity', { text: 'Checking request validity...' });
      const authReq = await checkReqValidity(params).catch(() => {})

      if (!authReq) {
        spinnies.fail('spinner-req-validity', { text: 'Your cli request is invalid' });
        return;
      }

      await validateStep(params, 'launch_cli');
      spinnies.succeed('spinner-req-validity');

      // Check missing params -----------------------------------------------------------

      const databaseQuestions = [];
      if (!params.db || !['mysql', 'postgresql', 'sqlite', 'mongodb'].includes(params.db)) {
        databaseQuestions.push(questions.database);
      }

      // If there is missing info
      if (databaseQuestions.length) {
        const databaseData = await inquirer.prompt(databaseQuestions);
        if (!params.db) {
          params.db = databaseData.database;
        }
      }

      // Ask for the database creddentials ----------------------------------------------

      const databaseCredentials = await inquirer.prompt(getDatabaseCredentialsQuestions(params.db));

      spinnies.add('spinner-connecting', { text: 'Connecting to the database...' });

      await generalHelper.timeout(1000);

      // Connect to the database --------------------------------------------------------

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

      const projectDetails = await inquirer.prompt(questions.general);
      const projectConfig = { ...params, ...projectDetails };
      await validateStep(params, 'master_password');

      // Generate project template ------------------------------------------------------

      spinnies.add('spinner-generating', { text: 'Generating the project structure...' });

      await generalHelper.timeout(2000);
      templateGenerator.createAdminTemplate(params.db, schemas, projectConfig, databaseCredentials);

      spinnies.succeed('spinner-generating');
      await validateStep(params, 'generation');

      // Success messages ---------------------------------------------------------------

      console.log('');
      spinnies.add('spinner-success-1', { text: 'Your project has been generated successfully!' });
      spinnies.succeed('spinner-success-1');
      spinnies.add('spinner-success-2', { text: 'You can now go to the proper directory and start your server with the following command: "npm start"' });
      spinnies.succeed('spinner-success-2');
      console.log('');
    })
    .parse(process.argv);
};