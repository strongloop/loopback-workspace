'use strict';

module.exports = function() {
  const testName = 'CreateDataSource';
  let templateName, datasourceId;

  this.Given(/^that I have a workspace created from a template '(.+)'$/,
  function(tmplName, next) {
    templateName = tmplName;
    next();
  });

  this.When(/^I create datasource '(.+)' with connector '(.+)'$/,
  function(dsName, connectorName, next) {
    datasourceId = 'common.datasources.' + dsName;
    const datasource = {
      id: datasourceId,
      name: dsName,
      connector: connectorName,
    };
    const DataSourceDefinition = this.getApp().models.DataSourceDefinition;
    this.createModel(DataSourceDefinition,
      datasource,
      templateName,
      testName,
      next);
  });

  this.Then(/^the datasource definition is created$/, function(next) {
    const storedDs =
      this.getWorkspace(templateName).getDataSource(datasourceId);
    const expectedDs = this.getInputsToCompare(testName);
    this.expect(expectedDs).to.eql(storedDs._content);
    next();
  });
};
