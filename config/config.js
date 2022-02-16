module.exports = (env) => {
  const config = {
    development: {
      apiUrl: 'http://localhost:3010'
    },
    staging: {
      apiUrl: 'https://staging-api.adminmate.io'
    },
    production: {
      apiUrl: 'https://api.adminmate.io'
    }
  }

  return config[env];
};
