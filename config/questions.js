export default {
  database: {
    name: 'database',
    type: 'list',
    message: 'What kind of database you want to use ?',
    choices: ['mysql', 'postgresql', 'sqlite', 'mongodb']
  },
  mongodb: [
    {
      name: 'host',
      type: 'input',
      message: 'Enter your MongoDB hostname',
      default: 'localhost'
    },
    {
      name: 'port',
      type: 'number',
      message: 'Enter your MongoDB port',
      default: 27017
    },
    {
      name: 'user',
      type: 'input',
      message: 'Enter your MongoDB username'
    },
    {
      name: 'password',
      type: 'password',
      mask: true,
      message: 'Enter your MongoDB password'
    },
    {
      name: 'name',
      type: 'input',
      message: 'Enter your MongoDB database name'
    },
    {
      name: 'srv',
      type: 'confirm',
      default: false,
      message: 'Do you use a SRV connection ?'
    }
  ],
  mysql: [
    {
      name: 'host',
      type: 'input',
      message: 'Enter your MySQL hostname',
      default: 'localhost'
    },
    {
      name: 'user',
      type: 'input',
      message: 'Enter your MySQL username'
    },
    {
      name: 'password',
      type: 'password',
      mask: true,
      message: 'Enter your MySQL password'
    },
    {
      name: 'name',
      type: 'input',
      message: 'Enter your MySQL database name'
    }
  ],
  general: [
    {
      name: 'master_password',
      type: 'password',
      mask: true,
      message: 'Type your master password (can be changed later)'
    }
  ]
};