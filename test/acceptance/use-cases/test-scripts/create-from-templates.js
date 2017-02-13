'use strict';
const app = require('../../../../');
const async = require('async');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const loopback = require('loopback');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../component/workspace-manager');

const Workspace = app.models.Workspace;
app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  this.Given(/^that the templates are loaded$/, function(next) {
    app.on('templates-loaded', next);
  });

  this.When(/^I create a workspace from the template '(.+)'$/,
  function(templateName, next) {
    this.createWorkspace(Workspace, templateName, next);
  });

  this.Then(/^the workspace is created$/, function(next) {
    const testsuite = this;
    this.setup(this.templateName);
    const template = workspaceManager.getTemplate(this.templateName);
    const tasks = [];
    if (template.server) {
      addTaskToCheckFacet(tasks, testsuite);
    }
    if (template.server.modelConfigs) {
      addTaskToCheckModelConfig(tasks, testsuite, template);
    };
    if (template.server.datasources) {
      addTaskToCheckDataSource(tasks, testsuite, template);
    }
    async.series(tasks, next);
  });
};

function addTaskToCheckFacet(tasks, testsuite) {
  tasks.push(function(cb) {
    testsuite.checkFacet(cb);
  });
}

function addTaskToCheckModelConfig(tasks, testsuite, template) {
  tasks.push(function(cb) {
    testsuite.readModelConfig(function(err, modelConfigs) {
      delete modelConfigs._meta;
      const expectedLength = template.server.modelConfigs.length;
      expect(Object.keys(modelConfigs).length).to.eql(expectedLength);
      cb();
    });
  });
}

function addTaskToCheckDataSource(tasks, testsuite, template) {
  const expectedDataSources = [];
  template.server.datasources.forEach(function(ds) {
    expectedDataSources.push(ds.name);
  });
  tasks.push(function(cb) {
    testsuite.readDataSource(function(err, datasources) {
      if (err) return cb(err);
      expect(Object.keys(datasources)).to.include.members(expectedDataSources);
      cb();
    });
  });
};
