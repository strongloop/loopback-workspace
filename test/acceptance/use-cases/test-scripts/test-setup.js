'use strict';

const world = require('../../../helpers/test-suite');

module.exports = function() {
  this.World = WorldConstructor;
};

const WorldConstructor = function(callback) {
  callback(world);
};
