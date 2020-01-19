'use strict';

const { Schema } = require('mongoose');
const _ = require('lodash');

const EventSchema = new Schema({
  title: String,
  description: String,
  date: Date,
  tag: String,
});

EventSchema.virtual('tagDisplayName').get(function() {
  return this.tag === 'allday' ? 'All Day' : _.capitalize(this.tag);
});

EventSchema.virtual('tagDisplayColour').get(function() {
  switch (this.tag) {
    case 'allday':
      return 'light';
    case 'night':
      return 'danger';
    case 'day':
      return 'primary';
    default:
      return 'info';
  }
});

module.exports = EventSchema;
