'use strict';

const testSupport = require('../../../helpers/test-support');

module.exports = function() {
  const testName = 'CreateMiddleware';
  let templateName, middlewareName, middlewarePhase;

  this.Given(/^The workspace '(.+)' has a '(.+)' phase$/,
  function(workspaceName, phaseName, next) {
    middlewarePhase = phaseName;
    templateName = workspaceName;
    next();
  });

  this.When(/^I create a middleware '(.+)'$/, function(name, next) {
    middlewareName = name;
    next();
  });

  this.When(/^with middleware function '(.+)' for paths '(.+)'$/,
  function(functionPath, routes, next) {
    const routesArray = routes.split(',');
    const middlewareDef = {
      name: middlewareName,
      function: functionPath,
      phase: middlewarePhase,
      path: routesArray,
      facetName: 'server',
    };
    const Middleware = this.getApp().models.Middleware;
    this.createModel(Middleware,
    middlewareDef,
    templateName,
    testName,
    function(err, data) {
      if (err) return next(err);
      next();
    });
  });

  this.Then(/^The middleware config is created$/, function(next) {
    const testsuite = this;
    const expectedMiddleware = testsuite.getSavedInputs(testName);
    delete expectedMiddleware.phase;
    const middlewareFile =
      testsuite.getWorkspace(templateName).getMiddlewareFilePath();
    testsuite.getMiddlewareConfig(templateName, function(err, middleware) {
      if (err) return next(err);
      const phase = middleware[middlewarePhase];
      const config = phase[expectedMiddleware.function];
      testsuite.expect(expectedMiddleware).to.eql(config);
      next();
    });
  });
};
