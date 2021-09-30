#!/usr/bin/env node

import commander from 'commander';
import inquirer from 'inquirer';
import figlet from 'figlet';
import ora from 'ora';
import axios from 'axios';

import questions from './config/questions.js';
import * as templateGenerator from './helpers/generator.js';
import * as dbHelper from './helpers/database.js';
import * as generalHelper from './helpers/general.js';

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
      url: 'http://localhost:3010/cli/check_auth',
      data: {
        project_id: params.pid,
        hash: params.hash
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
    url: 'http://localhost:3010/cli/validate_step',
    data: {
      project_id: params.pid,
      hash: params.hash,
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
    case 'postgresql':
    case 'sqlite':
      return [{
        name: 'host',
        type: 'input',
        message: 'sql host'
      }];
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
      // console.log(params);

      // Check request validity ---------------------------------------------------------

      const spinnerReqValidity = ora('Checking request validity...').start();
      const authReq = await checkReqValidity(params).catch(() => {})

      if (!authReq) {
        spinnerReqValidity.fail('Your cli request is invalid')
        return;
      }

      await validateStep(params, 'launch_cli');
      spinnerReqValidity.succeed('');

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

      const spinner = ora('Connecting to the database...').start();

      // Connect to the database --------------------------------------------------------

      const schemas = await dbHelper.getDatabaseSchemas(params.db, databaseCredentials)//'localhost', 27017, '', '', 'node-express-mongodb-server', false, false)
        .catch(err => {
          spinner.fail(`Fail to connect to the database: ${err}`);
        });

      if (!schemas) { return; }

      await validateStep(params, 'database');
      spinner.succeed();

      // Ask for last details -----------------------------------------------------------

      const projectDetails = await inquirer.prompt(questions.general);
      const projectConfig = { ...params, ...projectDetails };
      await validateStep(params, 'master_password');

      // Generate project template ------------------------------------------------------

      const generationSpinner = ora('Generating the project structure...').start();

      await generalHelper.timeout(2000);
      templateGenerator.createAdminTemplate('generated', params.db, schemas, projectConfig, databaseCredentials);

      generationSpinner.succeed();
      await validateStep(params, 'generation');

      console.log('');
      ora('Your project is ready!').succeed();
      ora('You can now start your server with the following command: "npm run dev"').info();
      console.log('');
    })
    .parse(process.argv);
};