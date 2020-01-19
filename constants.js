'use strict';

const _ = require('lodash');

const constants = {
  defaultTagColour: 'info',
  tags: {
    day: { displayName: 'Day', colour: 'primary' },
    night: { displayName: 'Night', colour: 'link' },
    chore: { displayName: 'Chore', colour: 'danger' },
  },
  tagsList: () => _.values(constants.tags),
};

module.exports = constants;
