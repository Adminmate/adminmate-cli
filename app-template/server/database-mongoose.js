const mongoose = require('mongoose');

const connectDb = () => {
  return mongoose.connect('mongodb://localhost:27017/node-express-mongodb-server', {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  });
};

const models = {};
const normalizedPath = require('path').join(__dirname, 'models');

require('fs').readdirSync(normalizedPath).forEach(file => {
  const modelName = file.replace('.js', '');
  models[modelName] = require(`./models/${file}`);
});


module.exports = { models, connectDb };