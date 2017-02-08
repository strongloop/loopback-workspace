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
const TYPE_OF_TEST = 'acceptance';

const Workspace = app.models.Workspace;
app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;
  this.Given(/^that the templates are loaded$/, function(next) {
    app.on('templates-loaded', next);
  });

  this.When(/^I create a workspace from the template '(.+)'$/,
  function(templateName, next) {
    testsuite.templateName = templateName;
    testsuite.destinationPath =
      testSupport.givenSandboxDir(TYPE_OF_TEST, testsuite.templateName);
    testSupport.givenEmptySandbox(testsuite.destinationPath, function(err) {
      if (err) return next(err);
      const data = {
        templateName: testsuite.templateName,
        destinationPath: testsuite.destinationPath,
      };
      Workspace.create(data, {}, next);
    });
  });

  this.Then(/^the workspace is created$/, function(next) {
    const workspace =
      workspaceManager.getWorkspaceByFolder(testsuite.destinationPath);
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
              if (modelConfig.name)
                expectedList.push(modelConfig.name);
            });
            delete modelConfigs._meta;
            expect(Object.keys(modelConfigs).length).to
              .eql(expectedList.length);
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
