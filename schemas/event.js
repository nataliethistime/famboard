'use strict';

const { Schema } = require('mongoose');

const EventSchema = new Schema({
  title: String,
  description: String,
  date: Date,
});

module.exports = EventSchema;
