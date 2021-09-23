'use strict';

const express = require('express');
const Adminmate = require('adminmate-express-sequelize');

// Environment vars
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3020;

const app = express();

// Global vars
global.NODE_ENV = env;
global.AM_DEV_MODE = !!process.env.npm_config_devmode;

// Set up jade
app.set('port', port);
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

// Connect to database
const db = require('./server/database');
db.sequelize.sync().then(() => {
  console.log('Adminmate Admin has started');
  console.log(`Dev Mode: ${global.AM_DEV_MODE}`);
});

{{#ifEquals database 'mongodb' }}mongoose{{else}}sequelize{{/ifEquals}}

// Add Adminmate
app.use(Adminmate.init(require('./server/config/adminmate')));

// Handle error 404 page
app.use((req, res) => {
  res.status(404).json({ message: '404 Not Found' });
});

// Listen for requests
app.listen(port, () => console.log(`App listening on port ${port}`));

// Handle all uncaught errors
process.on('uncaughtException', err => console.log(err));