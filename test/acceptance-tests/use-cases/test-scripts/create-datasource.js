'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
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
  this.Given(/^that I have a workspace created from a template$/,
  function(next) {
    workspaceManager.createWorkspace(testSupport.givenSandboxDir());
    next();
  });

  this.When(/^I create datasource '(.+)' with connector '(.+)'$/,
  function(dsName, connector, next) {
    testsuite.datasourceId = 'common.datasources.' + dsName;
    const datasource = {
      id: testsuite.datasourceId,
      name: dsName,
      connector: connector,
    };
    DataSourceDefinition.create(datasource, {}, function(err, data) {
      if (err) return next(err);
      testsuite.expectedDs = datasource;
      next();
    });
  });

  this.Then(/^the datasource definition is created$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const storedDs = workspace.getDataSource(testsuite.datasourceId);
    expect(testsuite.expectedDs).to.eql(storedDs._content);
    next();
  });

  this.When(/^I query for datasource '(.+)'$/,
  function(dsName, next) {
    testsuite.datasourceId = 'common.datasources.' + dsName;
    const filter = {
      where: {id: testsuite.datasourceId},
    };
    DataSourceDefinition.find(filter, function(err, data) {
      if (err) return next(err);
      testsuite.datasource = data;
      next();
    });
  });

  this.Then(/^the datasource definition is returned$/, function(next) {
    expect(Object.keys(testsuite.datasource))
    .to.include.members(['connector', 'name']);
    next();
  });
};
