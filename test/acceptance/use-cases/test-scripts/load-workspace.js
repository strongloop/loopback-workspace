'use strict';
const supertest = require('supertest');

module.exports = function() {
  const testName = 'LoadWorkspace';
  let templateName;

  this.Given(/^the '(.+)' workspace is not already loaded$/,
  function(name, next) {
    templateName = name;
    this.setup(templateName);
    next();
  });

  this.When(/^I load the workspace from the sandbox directory$/,
  function(next) {
    const testsuite = this;
    const directory = testsuite.getWorkspaceDir(templateName);
    supertest(this.getApp())
    .post('/api/Workspace/load-workspace')
    .send({directory: directory})
    .expect(200, function(err, response) {
      if (err) return next(err);
      const data = response.body;
      const workspace = testsuite.getWorkspace(templateName);
      testsuite.expect(workspace).to.not.to.be.undefined();
      next();
    });
  });

  this.Then(/^the workspace is loaded with datasources$/, function(next) {
    const testsuite = this;
    const workspace = testsuite.getWorkspace(templateName);
    const dir = workspace.getDirectory();
    const configData =
      workspace.facet('server').datasources().map({json: true, filter: 'id'});
    testsuite.getDataSourceConfig(templateName, function(err, data) {
      if (err) return next(err);
      testsuite.expect(configData).to.eql(data);
      next();
    });
  });

  this.Then(/^the workspace is loaded with middleware$/, function(next) {
    const testsuite = this;
    const configData =
      testsuite.getWorkspace(templateName)
      .facet('server')
      .phases()
      .map({json: true, includeComponents: true, filter: 'id'});
    this.getMiddlewareConfig(templateName, function(err, middleware) {
      if (err) return next(err);
      Object.keys(configData).forEach(function(key) {
        testsuite.expect(configData[key]).to.deep.eql(middleware[key]);
      });
      next();
    });
  });
};
