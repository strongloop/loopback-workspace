'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const loopback = require('loopback');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../component/workspace-manager');

const DataSourceDefinition = app.models.DataSourceDefinition;

app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;
  this.Given(/^that I have a workspace created from a template '(.+)'$/,
  function(templateName, next) {
    testsuite.templateName = templateName;
    next();
  });

  this.When(/^I create datasource '(.+)' with connector '(.+)'$/,
  function(dsName, connector, next) {
    this.setup(testsuite.templateName);
    const datasourceId = 'common.datasources.' + dsName;
    const datasource = {
      id: datasourceId,
      name: dsName,
      connector: connector,
    };
    this.saveInputs(datasource);
    this.createModel(DataSourceDefinition, next);
  });

  this.Then(/^the datasource definition is created$/, function(next) {
    const storedDs = this.workspace.getDataSource(testsuite.datasourceId);
    const expectedDs = this.getInputsToCompare();
    expect(expectedDs).to.eql(storedDs._content);
    next();
  });
};
