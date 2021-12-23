module.exports = {
  projects: [
    {
      displayName: 'mongodb',
      testMatch: ['<rootDir>/test/mongodb.test.js']
    },
    {
      displayName: 'mysql',
      testMatch: ['<rootDir>/test/mysql.test.js']
    },
    // {
    //   displayName: 'sqlite',
    //   testMatch: ['<rootDir>/test/sqlite.test.js']
    // },
    {
      displayName: 'postgres',
      testMatch: ['<rootDir>/test/postgres.test.js']
    }
  ]
}