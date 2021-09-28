#!/usr/bin/env node

import commander from 'commander';
import inquirer from 'inquirer';
import figlet from 'figlet';
import ora from 'ora';
import axios from 'axios';

import * as templateGenerator from './helpers/generator.js';
import * as mongodbHelper from './helpers/mongodb.js';

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
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const authReq = axios({
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
    }, 2000);
  });
}

const commandLine = () => {
  commander
    .usage('[options] <file>')
    .requiredOption('--project <project>', 'use project')
    .requiredOption('--pid <pid>', 'use project id')
    .requiredOption('--sk <sk>', 'use secret key')
    .requiredOption('--hash <hash>', 'use hash')
    .option('--database <database>', 'use database')
    .action(async (params, options) => {
      // console.log(params);

      const spinnerReqValidity = ora('Checking request validity...').start();
      const authReq = await checkReqValidity(params).catch(() => {})

      if (!authReq) {
        spinnerReqValidity.fail('Your cli request is invalid')
        return;
      }
      spinnerReqValidity.succeed('');
      console.log('');

      const databaseQuestions = [];
      if (!params.database || !['mysql', 'postgresql', 'sqlite', 'mongodb'].includes(params.database)) {
        databaseQuestions.push(databaseQuestion);
      }

      // If there is missing info
      if (databaseQuestions.length) {
        const databaseData = await inquirer.prompt(databaseQuestions)
        if (!params.database) {
          params.database = databaseData.database
        }
        // console.log(JSON.stringify(databaseData))
      }

      console.log('');

      console.log('Installation steps:')
      const spinner = ora('1 - Connecting to the database...').start();

      setTimeout(() => {
        mongodbHelper.getDatabaseSchema('localhost', 27017, '', '', 'node-express-mongodb-server', false, false, schemas => {
          spinner.succeed('1 - Connected to the database!');

          const spinner2 = ora('2 - Generating project files...').start();
          setTimeout(() => {
            spinner2.succeed('2 - Project has been generated!');
            console.log('');
            ora('Your project is ready!').succeed();
            ora('You can now start your server with the following command: "npm run dev"').info();
            console.log('');
          }, 3000);

          templateGenerator.createAdminTemplate('generated', 'mongodb', schemas);
        });
      }, 3000);
    })
    .parse(process.argv);
};