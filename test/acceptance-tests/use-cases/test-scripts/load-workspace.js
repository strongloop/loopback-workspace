'use strict';
const app = require('../../../../');
const async = require('async');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const loopback = require('loopback');
const path = require('path');
const supertest = require('supertest');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../component/workspace-manager');

const Workspace = app.models.Workspace;

app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;
  this.Given(/^the workspace is not already loaded$/, function(next) {
    testsuite.destinationPath = testSupport.givenSandboxDir();
    const workspace =
      workspaceManager.getWorkspaceByFolder(testsuite.destinationPath);
    workspaceManager.deleteWorkspace(workspace.getId());
    next();
  });

  this.When(/^I load the workspace from the sandbox directory$/,
  function(next) {
    const app = require('../../../../');
    const directory = testsuite.destinationPath;
    supertest(app)
    .post('/api/Workspace/load-workspace')
    .send(directory)
    .expect(200, function(err, response) {
      if (err) return next(err);
      const data = response.body;
      expect(data.workspaceId).to.not.to.be.undefined();
      expect(data.workspaceId).to.be.eql('0002');
      expect(data.errors).to.not.to.be.undefined();
      expect(data.errors.length).to.be.eql(0);
      next();
    });
  });

  this.Then(/^the workspace is loaded with datasources$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const dir = workspace.getDirectory();
    expect(dir).to.be.eql(testSupport.givenSandboxDir());
    const file = workspace.getDataSourceConfigFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const dsList = workspace.getAllDataSources();
      const configData = {};
      Object.keys(dsList).forEach(function(key) {
        const ds = dsList[key];
        configData[key] = ds.getDefinition();
      });
      expect(data).to.not.to.be.undefined();
      Object.keys(configData).forEach(function(key) {
        expect(configData[key]).to.eql(data[key]);
      });
      next();
    });
  });

  this.Then(/^the workspace is loaded with middleware$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const dir = workspace.getDirectory();
    const middlewareFile = workspace.getMiddlewareFilePath();
    fs.readJson(middlewareFile, function(err, middleware) {
      if (err) return next(err);
      const configData = workspace.getMiddlewareConfig();
      Object.keys(configData).forEach(function(key) {
        expect(configData[key]).to.deep.eql(middleware[key]);
      });
      next();
    });
  });
};
