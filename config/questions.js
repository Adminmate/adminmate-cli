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