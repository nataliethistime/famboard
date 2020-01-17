'use strict';

const express = require('express');
const config = require('./config');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Hello, World!'));

app.listen(port, () => {
  console.log('Listening at localhost:' + port)
  console.log(config.toObject());
});
