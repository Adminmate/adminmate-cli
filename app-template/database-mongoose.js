const mongoose = require('mongoose');

const connectDb = () => {
  return mongoose.connect(process.env.AM_DB_URL, {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
};

const normalizedPath = require('path').join(__dirname, 'models');

const models = {};
require('fs').readdirSync(normalizedPath).forEach(file => {
  const modelName = file.replace('.js', '');
  models[modelName] = require(`./models/${file}`)(mongoose);
});

module.exports = { models, connectDb };