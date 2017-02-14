'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const clone = require('lodash').clone;
const loopback = require('loopback');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../component/workspace-manager');

const ModelAccessControl = app.models.ModelAccessControl;

app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;

  this.When(/^I add acl to model '(.+)'$/,
  function(modelName, next) {
    const config = {
      index: 0,
      modelId: 'common.models.' + modelName,
      property: 'find',
      accessType: 'EXECUTE',
      principalType: 'ROLE',
      principalId: '$authenticated',
      permission: 'ALLOW',
    };
    const options = {workspaceId: testsuite.workspace.getId()};
    ModelAccessControl.create(config, options, function(err, data) {
      if (err) return next(err);
      next();
    });
  });

  this.Then(/^the model acl is created$/, function(next) {
    next();
  });
};
