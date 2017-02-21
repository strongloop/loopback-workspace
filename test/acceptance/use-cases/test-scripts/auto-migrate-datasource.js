'use strict';

const testName = 'MigrateDataSource';
const testSupport = require('../../../helpers/test-support');

module.exports = function() {
  let templateName, datasourceName, ModelName, result;

  this
  .Given(/^workspace '(.+)' has model '(.+)' attached to datasource '(.+)'$/,
  function(workspaceName, modelName, dsName, next) {
    const testsuite = this;
    templateName = workspaceName;
    datasourceName = dsName;
    ModelName = modelName;
    const data = {where: {name: dsName}};
    const DataSourceDefinition = this.getApp().models.DataSourceDefinition;
    if (!process.env.CI)
      return testsuite.injectMockDataSource(templateName, next);
    testSupport.configureMySQLDataSource(
      testsuite,
      DataSourceDefinition,
      templateName,
      testName,
      data,
      next);
  });

  this.When(/^I migrate the model$/, function(next) {
    const Workspace = this.getApp().models.Workspace;
    const testsuite = this;
    Workspace.migrateDataSource(
      this.getWorkspaceId(templateName),
      datasourceName,
      ModelName,
      function(err, ds) {
        if (err) return next(err);
        result = Object.keys(ds)[0];
        next();
      });
  });

  this.Then(/^the model is migrated$/, function(next) {
    this.expect(result).to.contain(ModelName);
    next();
  });
};
