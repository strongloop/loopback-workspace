'use strict';

module.exports = function() {
  const testName = 'CreateDataSource';
  let templateName, datasourceName;
  let it = this.When;
  it(/^I create datasource '(.+)' with connector '(.+)' in workspace '(.+)'$/,
  function(dsName, connectorName, tmplName, next) {
    templateName = tmplName;
    datasourceName = dsName;
    const datasource = {
      name: dsName,
      facetName: 'server',
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
      this.getWorkspace(templateName).getDataSource('server.' + datasourceName);
    const expectedDs = this.getInputsToCompare(testName);
    this.expect(expectedDs).to.eql(storedDs._content);
    next();
  });
};
