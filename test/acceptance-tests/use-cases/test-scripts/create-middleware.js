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
  this.Given(/^The workspace has a '(.+)' phase$/, function(phaseName, next) {
    testsuite.middlewarePhase = phaseName;
    next();
  });

  this.When(/^I create a middleware '(.+)'$/, function(name, next) {
    testsuite.middlewareName = name;
    next();
  });

  this.When(/^with middleware function '(.+)' for paths '(.+)'$/,
  function(functionPath, routes, next) {
    const routesArray = routes.split(',');
    const middlewareDef = {
      name: testsuite.middlewareName,
      function: functionPath,
      phase: testsuite.middlewarePhase,
      path: routesArray,
    };
    Middleware.create(middlewareDef, {}, function(err, data) {
      if (err) return next(err);
      testsuite.middlewareDef = middlewareDef;
      testsuite.expectedMiddleware = clone(middlewareDef);
      delete testsuite.expectedMiddleware.phase;
      next();
    });
  });

  this.Then(/^The middleware config is created$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const middlewareFile = workspace.getMiddlewareFilePath();
    fs.readJson(middlewareFile, function(err, middleware) {
      if (err) return next(err);
      const middlewarePhase = middleware[testsuite.middlewarePhase];
      const config = middlewarePhase[testsuite.expectedMiddleware.function];
      expect(testsuite.expectedMiddleware).to.eql(config);
      next();
    });
  });

  this.When(/^I query for the middleware method '(.+)'$/,
  function(middlewareId, next) {
    testsuite.middlewareId = middlewareId;
    const filter = {where: {id: testsuite.middlewareId}};
    Middleware.find(filter, {}, function(err, config) {
      if (err) return next(err);
      testsuite.middlewareConfig = config;
      next();
    });
  });

  this.Then(/^The middleware config for the method is returned$/,
  function(next) {
    expect(Object.keys(testsuite.middlewareConfig)).to.include.members([
      'name',
      'path',
    ]);
    next();
  });
};
