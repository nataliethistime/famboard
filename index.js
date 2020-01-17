'use strict';

const express = require('express');
const handlebars = require('express-handlebars');
const config = require('./config');
const mongoose = require('mongoose');
const basicAuth = require('express-basic-auth');

const app = express();
const port = process.env.PORT || 3000;
const db = process.env.MONGO_URI || 'mongodb://localhost:27017/famboard';

app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');

app.use(basicAuth({
  challenge: true,
  realm: 'Application',
  users: {
    [config.get('username')]: config.get('password'),
  },
}));

app.get('/', (req, res) => {
  res.render('home');
});

(async () => {
  console.log('Connecting to db');
  await mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true });

  console.log('Initializing schemas');
  mongoose.model('Event', require('./schemas/event'));

  console.log('Booting up server');
  app.listen(port, () => {
    console.log('Listening at localhost:' + port)
    console.log(config.toObject());
  });
})();
