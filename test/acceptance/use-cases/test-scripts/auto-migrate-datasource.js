'use strict';

module.exports = function() {
  const testName = 'MigrateDataSource';
  let templateName, datasourceName, ModelName, result;

  this
  .Given(/^workspace '(.+)' has model '(.+)' attached to datasource '(.+)'$/,
  function(workspaceName, modelName, dsName, next) {
    const testsuite = this;
    templateName = workspaceName;
    datasourceName = dsName;
    ModelName = modelName;
    testsuite.injectMockDataSource(templateName, next);
  });

  this.When(/^I migrate the model$/, function(next) {
    const Workspace = this.getApp().models.Workspace;
    Workspace.migrateDataSource(
      this.getWorkspaceId(templateName),
      datasourceName,
      ModelName,
      function(err, ds) {
        if (err) return next(err);
        result = ds;
        next();
      });
  });

  this.Then(/^the model is migrated$/, function(next) {
    const workspace = this.getWorkspace(templateName);
    const model = workspace.getModel('common.models.' + ModelName);
    const expectedFields = Object.keys(model.getDefinition().properties);
    this.expect(Object.keys(result)).to.include.members(expectedFields);
    next();
  });
};
