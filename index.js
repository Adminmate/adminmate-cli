#!/usr/bin/env node

import commander from 'commander';
import inquirer from 'inquirer';
import figlet from 'figlet';
import ora from 'ora';

figlet('Adminmate', function(err, data) {
  console.log(data)

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
  {
    name: 'uri',
    type: 'input',
    message: 'What the connection uri of your database ? (ex: mongodb://username:password@host:port/database)'
  }
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
    .action((params, options) => {
      console.log(params);
      console.log('');

      inquirer.prompt(databaseQuestions)
        .then(result => {
          console.log(JSON.stringify(result))

          const spinner = ora('Connecting to the database...').start();

          setTimeout(() => {
            // spinner.stop();
            spinner.succeed('Database connection succeed');

            inquirer.prompt(projectQuestions)
              .then(result => {
                console.log(JSON.stringify(result))
              });

          }, 2000);

        })
    })
    .parse(process.argv);
}