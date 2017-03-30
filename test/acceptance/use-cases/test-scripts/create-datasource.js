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
    const facet = this.getWorkspace(templateName).facets('server');
    const storedDs = facet.datasources(datasourceName).getContents();
    const expectedDs = this.getInputsToCompare(testName);
    this.expect(expectedDs.datasource).to.eql(storedDs.datasource);
    next();
  });
};
