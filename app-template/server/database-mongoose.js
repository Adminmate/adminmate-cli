const mongoose = require('mongoose');

const connectDb = () => {
  // todo config proper
  // 'mongodb://localhost:27017/node-express-mongodb-server'
  return mongoose.connect(process.env.AM_DB_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
};

const models = {};
const normalizedPath = require('path').join(__dirname, 'models');

require('fs').readdirSync(normalizedPath).forEach(file => {
  const modelName = file.replace('.js', '');
  models[modelName] = require(`./models/${file}`)(mongoose);
});

module.exports = { models, connectDb };