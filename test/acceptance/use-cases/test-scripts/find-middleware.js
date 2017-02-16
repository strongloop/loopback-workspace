'use strict';

module.exports = function() {
  const testName = 'FindMiddleware';
  let templateName, output;

  this.
  When(/^I query for the middleware method '(.+)' in the workspace '(.+)'$/,
  function(middlewareId, workspaceName, next) {
    const testsuite = this;
    templateName = workspaceName;
    const filter = {where: {id: middlewareId}};
    const Middleware = this.getApp().models.Middleware;
    testsuite.findModel(Middleware,
    filter,
    templateName,
    testName,
    function(err, config) {
      if (err) return next(err);
      output = config;
      next();
    });
  });

  this.Then(/^The middleware config for the method is returned$/,
  function(next) {
    this.expect(output).to.not.to.be.undefined();
    next();
  });
};
