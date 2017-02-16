'use strict';
const async = require('async');
const fs = require('fs');
const path = require('path');
const verifications = require('../verification-helper');

module.exports = function() {
  const testName = 'CreateTemplate';
  let templateName;

  this.Given(/^that the templates are loaded$/, function(next) {
    this.getApp().on('templates-loaded', next);
  });

  this.When(/^I create a workspace from the template '(.+)'$/,
  function(tmplName, next) {
    templateName = tmplName;
    const Workspace = this.getApp().models.Workspace;
    this.createWorkspace(Workspace, templateName, next);
  });

  this.Then(/^the workspace is created$/, function(next) {
    const testsuite = this;
    this.setup(templateName);
    const template = this.getTemplate(templateName);
    const tasks = [];
    if (template.server) {
      tasks.push(function(cb) {
        verifications.verifyFacet(testsuite, templateName, cb);
      });
      if (template.server.modelConfigs) {
        tasks.push(function(cb) {
          verifications.verifyModelConfigs(testsuite, templateName, cb);
        });
      }
      if (template.server.datasources) {
        tasks.push(function(cb) {
          verifications.verifyDataSources(testsuite, templateName, cb);
        });
      }
    }
    async.series(tasks, next);
  });
};
