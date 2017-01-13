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

  this.When(/^I query for datasource '(.+)' from the default workspace$/,
  function(dsName, next) {
    const workspace = workspaceManager.getWorkspace();
    const workspaceId = workspace.getId();
    const options = {workspaceId: workspaceId};
    testsuite.datasourceId = 'common.datasources.' + dsName;
    const filter = {where: {id: testsuite.datasourceId}};
    DataSourceDefinition.find(
      filter,
      options,
      function(err, data) {
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

  this.When(/^I update datasource '(.+)' with connector '(.+)'$/,
  function(dsName, connector, next) {
    testsuite.datasourceId = 'common.datasources.' + dsName;
    const datasource = {
      connector: connector,
    };
    testsuite.expectedFields = {};
    DataSourceDefinition.updateAttributes(testsuite.datasourceId, datasource,
    {},
    function(err, data) {
      if (err) return next(err);
      testsuite.expectedFields.datasource = datasource;
      next();
    });
  });

  this.Then(/^the datasource configuration is updated$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const file = workspace.getDataSourceConfigFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const config = data[testsuite.datasourceId];
      expect(config).to.not.to.be.undefined();
      Object.keys(testsuite.expectedFields.datasource).forEach(function(key) {
        expect(testsuite.expectedFields.datasource[key]).to.eql(config[key]);
      });
      next();
    });
  });
};
