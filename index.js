#!/usr/bin/env node

import commander from 'commander';
import inquirer from 'inquirer';
import figlet from 'figlet';
import ora from 'ora';

import * as templateGenerator from './helpers/generator.js';
import * as mongodbHelper from './helpers/mongodb.js';

figlet('Adminmate', function(err, data) {
  console.log(data);

  // Launch command line program
  commandLine();
});

const databaseQuestions = [
  {
    name: 'database',
    type: 'list',
    message: 'What kind of database you want to use ?',
    choices: ['mysql', 'postgresql', 'sqlite', 'mongodb']
  },
  // {
  //   name: 'uri',
  //   type: 'input',
  //   message: 'What the connection uri of your database ? (ex: mongodb://username:password@host:port/database)'
  // }
];

const projectQuestions = [
  {
    name: 'master_password',
    type: 'input',
    message: 'What will be your master password (can be changed whenever you want) ?'
  }
];

const commandLine = () => {
  commander
    .usage('[options] <file>')
    .option('--database <database>', 'use database')
    .action(async (params, options) => {
      // console.log(params);
      console.log('');

      const databaseData = await inquirer.prompt(databaseQuestions)
      // console.log(JSON.stringify(databaseData))

      console.log('');

      console.log('Installation steps:')
      const spinner = ora('1 - Connecting to the database').start();

      setTimeout(() => {
        mongodbHelper.getDatabaseSchema('localhost', 27017, '', '', 'node-express-mongodb-server', false, false, schemas => {
          spinner.succeed();

          const spinner2 = ora('2 - Generating project files').start();
          setTimeout(() => {
            spinner2.succeed();
            console.log('');
            ora('Your project is ready!').succeed();
            ora('You can now start your server with the following command: "npm run dev"').info();
            console.log('');
          }, 2000);

          templateGenerator.createAdminTemplate('generated', 'mongodb', schemas);
        });
      }, 2000);
    })
    .parse(process.argv);
};