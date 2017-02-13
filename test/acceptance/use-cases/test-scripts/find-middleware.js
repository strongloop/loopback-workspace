'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const clone = require('lodash').clone;
const loopback = require('loopback');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../component/workspace-manager');

const Middleware = app.models.Middleware;
app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;
  this.When(/^I query for the middleware method '(.+)'$/,
  function(middlewareId, next) {
    testsuite.middlewareId = middlewareId;
    const filter = {where: {id: testsuite.middlewareId}};
    const options = {workspaceId: testsuite.workspace.getId()};
    Middleware.find(filter, options, function(err, config) {
      if (err) return next(err);
      testsuite.middlewareConfig = config;
      next();
    });
  });

  this.Then(/^The middleware config for the method is returned$/,
  function(next) {
    expect(testsuite.middlewareConfig).to.not.to.be.undefined();
    next();
  });
};
