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
  const testsuite = this;
  this.Given(/^that the templates are loaded$/, function(next) {
    testsuite.destinationPath = testSupport.givenSandboxDir();
    app.on('templates-loaded', next);
  });

  this.When(/^I create a workspace from the template '(.+)'$/,
  function(templateName, next) {
    testsuite.templateName = templateName;
    const data = {
      templateName: testsuite.templateName,
      destinationPath: testsuite.destinationPath,
    };
    Workspace.create(data, {}, next);
  });

  this.Then(/^the workspace is created$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const dir = workspace.getDirectory();
    const template = workspaceManager.getTemplate(testsuite.templateName);
    const tasks = [];
    if (template.server) {
      const serverDir = path.join(dir, 'server');
      tasks.push(function(cb) {
        fs.readdir(serverDir, function(err, fileList) {
          if (err) return cb(err);
          const expectedList = ['config.json', 'model-config.json'];
          expect(fileList).to.include.members(expectedList);
          cb();
        });
      });
      if (template.server.modelConfigs) {
        tasks.push(function(cb) {
          const facet = workspace.getFacet('server');
          const modelConfigPath = facet.getModelConfigPath();
          fs.readJson(modelConfigPath, function(err, modelConfigs) {
            if (err) return cb(err);
            const expectedList = [];
            template.server.modelConfigs.forEach(function(modelConfig) {
              expectedList.push(modelConfig.name);
            });
            expect(Object.keys(modelConfigs)).to.include.members(expectedList);
            cb();
          });
        });
      }
      if (template.server.datasources) {
        tasks.push(function(cb) {
          const configFile = workspace.getDataSourceConfigFilePath();
          fs.readJson(configFile, function(err, datasources) {
            if (err) return cb(err);
            const expectedList = [];
            template.server.datasources.forEach(function(ds) {
              expectedList.push(ds.name);
            });
            expect(Object.keys(datasources)).to.include.members(expectedList);
            cb();
          });
        });
      }
    }
    async.series(tasks, next);
  });
};
