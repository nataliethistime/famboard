'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const handlebars = require('express-handlebars');
const handlebarsHelpers = require('handlebars-helpers');
const config = require('./config');
const mongoose = require('mongoose');
const basicAuth = require('express-basic-auth');
const moment = require('moment');
const _ = require('lodash');
const { tags } = require('./constants');

const app = express();
const port = process.env.PORT || 3000;
const db = process.env.MONGODB_URI || 'mongodb://db:27017/famboard';

//
// Delete the `date` helper so that it doesn't get confused with template variables named `date`.
// See here for more: https://github.com/helpers/handlebars-helpers/issues/359
//
let helpers = handlebarsHelpers();
delete helpers.date;

app.engine('handlebars', handlebars({ helpers }));
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
  const today = moment().startOf('isoweek');
  const qWeek = parseInt(req.query.week, 10);
  const weekStart = qWeek ? moment(qWeek).startOf('isoweek') : today;

  for (let i = 0; i < 7; i++) {
    const start = moment(weekStart).startOf('day').add(i, 'day').toDate();
    const end = moment(start).endOf('day').toDate();
    const events = await Event.find({ date : { $gte: start, $lte: end }});
    days.push({
      title: moment(start).format('ddd DD').toUpperCase(),
      date: moment(start).valueOf(),
      events: _.map(events, (e) => e.toObject({ virtuals: true })),
    });
  }

  res.render('home', {
    name: config.get('name'),
    days,
    month: moment(weekStart).format('MMMM'),
    week: moment(weekStart).valueOf(),
    previousWeekEpoch: moment(weekStart).subtract(1, 'week').valueOf(),
    nextWeekEpoch: moment(weekStart).add(1, 'week').valueOf(),
    showTodayLink: !!req.query.week && !today.isSame(qWeek),
  });
});

app.get('/event/new', (req, res) => {
  const date = moment(parseInt(req.query.date, 10) || Date.now()).format('YYYY-MM-DD');
  const referer = req.query.referer || '';
  res.render('new-event', { date, referer, tags });
});

app.post('/event/new', async (req, res) => {
  const Event = mongoose.model('Event');
  const { title, description, tag, date, referer } = req.body;

  const e = new Event({
    title, description, tag,
    date: moment(date).valueOf(),
  });
  await e.save();

  res.redirect('/' + (referer ? '?week=' + referer : ''));
});

app.get('/event/edit/:id', async (req, res) => {
  const Event = mongoose.model('Event');
  const event = await Event.findById(req.params.id).lean();

  if (!event) {
    return res.render('404');
  }

  res.render('edit-event', {
    _id: event._id,
    title: event.title,
    description: event.description,
    tag: event.tag,
    date: moment(event.date).format('YYYY-MM-DD'),
    referer: req.query.referer || '',
    tags,
  });
});

app.post('/event/update/:id', async (req, res) => {
  const Event = mongoose.model('Event');
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.redirect('404');
  }

  event.set({
    title: req.body.title,
    description: req.body.description,
    date: req.body.date,
    tag: req.body.tag,
  });
  await event.save();

  res.redirect('/' + (req.body.referer ? '?week=' + req.body.referer : ''));
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
