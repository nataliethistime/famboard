'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const config = require('./config');
const mongoose = require('mongoose');
const basicAuth = require('express-basic-auth');
const moment = require('moment');

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
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', async (req, res) => {
  const Event = mongoose.model('Event');

  const days = [];
  const weekStart = moment(parseInt(req.query.week, 10) || Date.now()).startOf('isoweek');

  for (let i = 0; i < 7; i++) {
    const start = moment(weekStart).startOf('day').add(i, 'day').toDate();
    const end = moment(start).endOf('day').toDate();
    console.log('start', start);
    console.log('end', end);
    const events = await Event.find({ date : { $gte: start, $lte: end }}).lean();
    events.push({ title: 'Today', description: 'Hello this is an event' });
    days.push({
      title: moment(start).format('dddd Do'),
      date: moment(start).valueOf(),
      events,
    });
  }

  console.log(days);

  res.render('home', {
    name: config.get('name'),
    days,
    month: moment(weekStart).format('MMMM'),
    previousWeekEpoch: moment(weekStart).subtract(1, 'week').valueOf(),
    nextWeekEpoch: moment(weekStart).add(1, 'week').valueOf(),
    showTodayLink: !!req.query.week,
  });
});

app.get('/event/new', (req, res) => {
  res.render('new-event');
});

app.post('/event/new', async (req, res) => {
  const Event = mongoose.model('Event');
  const { title, description, date } = req.body;

  const e = new Event({
    title, description,
    date: moment(date).valueOf(),
  });
  await e.save();

  res.redirect('/');
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
