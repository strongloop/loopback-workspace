'use strict';
var app = require('../../../../');
var expect = require('../../../helpers/expect');
var loopback = require('loopback');
var path = require('path');
var util = require('util');
var workspaceManager = require('../../../../component/workspace-manager.js');
var DataSourceDefinition = app.models.DataSourceDefinition;
app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  var testsuite = this;
  this.Given(/^that I have loaded the workspace$/, function(next) {
    //TODO(DEEPAK) - modify here to load a particular workspace dir
    next();
  });

  this.When(/^I create datasource '(.+)' with connector '(.+)'$/,
    function(dsName, connector, next) {
      testsuite.datasourceId = 'common.datasources.' + dsName;
      var datasource = {
        'id': testsuite.datasourceId,
        'name': dsName,
        'connector': connector,
      };
      DataSourceDefinition.create(datasource, {}, function(err, data) {
        if (err) return next(err);
        testsuite.expectedDs = datasource;
        next();
      });
    });

  this.Then(/^the datasource definition is created$/, function(next) {
    var workspace = workspaceManager.getWorkspace();
    var storedDs = workspace.getDataSource(testsuite.datasourceId);
    expect(testsuite.expectedDs).to.eql(storedDs);
    next();
  });
};
