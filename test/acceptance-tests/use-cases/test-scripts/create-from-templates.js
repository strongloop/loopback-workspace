'use strict';
const app = require('../../../../');
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
    testsuite.destinationPath =
      path.resolve(__dirname, '../../../', 'sandbox2');
    app.on('templates-loaded', function() {
      next();
    });
  });

  this.When(/^I create a workspace from the template '(.+)'$/,
  function(templateName, next) {
    const data = {
      templateName: templateName,
      destinationPath: testsuite.destinationPath,
    };
    Workspace.create(data, {}, function(err, data) {
      if (err) return next(err);
      next();
    });
  });

  this.Then(/^the workspace is created$/, function(next) {
    next();
  });
};
