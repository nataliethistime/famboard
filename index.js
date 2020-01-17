'use strict';

const express = require('express');
const config = require('./config');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;
const db = process.env.MONGO_URI || 'mongodb://localhost:27017/famboard';

app.get('/', (req, res) => res.send('Hello, World!'));

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
