'use strict';

const _ = require('lodash');

const config = {
  isProduction() {
    return process.env.NODE_ENV === 'production';
  },

  get(key) {
    return process.env['FAMBOARD_' + String(key).toUpperCase()] || defaults[key] || undefined;
  },

  toObject() {
    return _.mapValues(defaults, (val, key) => config.get(key));
  }
};

const defaults = {
  name: config.isProduction() ? 'Untitled' : 'Developer Board',
  username: 'famboard',
  password: '1234qwer',
};

module.exports = config;
