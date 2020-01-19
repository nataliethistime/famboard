'use strict';

const { Schema } = require('mongoose');
const _ = require('lodash');

const { tags, defaultTagColour } = require('../constants');

const EventSchema = new Schema({
  title: String,
  description: String,
  date: Date,
  tag: String,
});

EventSchema.virtual('tagDisplayName').get(function() {
  return tags[this.tag] ? tags[this.tag].displayName : _.capitalize(this.tag);
});

EventSchema.virtual('tagDisplayColour').get(function() {
  return tags[this.tag] ? tags[this.tag].colour : defaultTagColour;
});

module.exports = EventSchema;
