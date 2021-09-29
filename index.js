#!/usr/bin/env node

import commander from 'commander';
import inquirer from 'inquirer';
import figlet from 'figlet';
import ora from 'ora';
import axios from 'axios';

import * as templateGenerator from './helpers/generator.js';
import * as mongodbHelper from './helpers/mongodb.js';
import * as generalHelper from './helpers/general.js';

figlet('Adminmate', function(err, data) {
  console.log('');
  console.log(data);

  // Launch command line program
  commandLine();
});

const databaseQuestion = {
  name: 'database',
  type: 'list',
  message: 'What kind of database you want to use ?',
  choices: ['mysql', 'postgresql', 'sqlite', 'mongodb']
};
// {
//   name: 'uri',
//   type: 'input',
//   message: 'What the connection uri of your database ? (ex: mongodb://username:password@host:port/database)'
// }

const projectQuestions = [
  {
    name: 'master_password',
    type: 'input',
    message: 'What will be your master password (can be changed whenever you want) ?'
  }
];

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

const mongodbQuestions = [
  {
    name: 'host',
    type: 'input',
    message: 'Type your database hostname',
    default: 'localhost'
  },
  {
    name: 'port',
    type: 'number',
    message: 'Type your database port',
    default: 27017
  },
  {
    name: 'user',
    type: 'input',
    message: 'Type your database username'
  },
  {
    name: 'password',
    type: 'password',
    mask: true,
    message: 'Type your database password'
  },
  {
    name: 'name',
    type: 'input',
    message: 'Type your database name'
  },
  {
    name: 'srv',
    type: 'confirm',
    default: false,
    message: 'Do you use a SRV connection ?'
  }
];

const getDatabaseCredentialsQuestions = db => {
  switch (db) {
    case 'mongodb':
      return mongodbQuestions;
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
      spinnerReqValidity.succeed('');

      // Check missing params -----------------------------------------------------------

      const databaseQuestions = [];
      if (!params.db || !['mysql', 'postgresql', 'sqlite', 'mongodb'].includes(params.db)) {
        databaseQuestions.push(databaseQuestion);
      }

      // If there is missing info
      if (databaseQuestions.length) {
        console.log('');
        const databaseData = await inquirer.prompt(databaseQuestions);
        if (!params.db) {
          params.db = databaseData.database;
        }
        console.log('');
      }

      // Ask for the database creddentials ----------------------------------------------

      const databaseCredentials = await inquirer.prompt(getDatabaseCredentialsQuestions(params.db));
      console.log('===databaseCredentials', databaseCredentials);

      // console.log('');

      const spinner = ora('Connecting to the database...').start();

      // Connect to the database --------------------------------------------------------

      const schemas = await mongodbHelper.getDatabaseSchemas('localhost', 27017, '', '', 'node-express-mongodb-server', false, false)
        .catch(err => {
          spinner.fail(`Fail to connect to the database: ${err}`);
        });

      if (!schemas) { return; }

      spinner.succeed();

      // Generate project template ------------------------------------------------------

      const generationSpinner = ora('Generating the project structure...').start();

      await generalHelper.timeout(2000);
      templateGenerator.createAdminTemplate('generated', 'mongodb', schemas);

      generationSpinner.succeed();

      console.log('');
      ora('Your project is ready!').succeed();
      ora('You can now start your server with the following command: "npm run dev"').info();
      console.log('');
    })
    .parse(process.argv);
};