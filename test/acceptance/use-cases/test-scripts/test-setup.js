'use strict';

const testSupport = require('../../../helpers/test-support');
const workspaceManager = require('../../../../component/workspace-manager');

module.exports = function() {
  this.World = WorldConstructor;
  this.registerHandler('BeforeFeature', function(event, next) {
    return next();
  });
  this.registerHandler('AfterFeature', function(event, next) {
    return next();
  });
};

const WorldConstructor = function(callback) {
  const world = require('../../../helpers/test-suite.js');
  callback(world);
};
