module.exports = function(env) {
  const config = {
    development: {
      apiUrl: 'http://localhost:3020'
    },
    production: {
      apiUrl: 'https://demo-api.adminmate.io'
    }
  };
  return config[env] || {};
}