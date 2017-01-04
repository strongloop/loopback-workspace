'use strict';
const app = require('../../../../');
const expect = require('../../../helpers/expect');
const fs = require('fs-extra');
const loopback = require('loopback');
const path = require('path');
const testSupport = require('../../../helpers/test-support');
const util = require('util');
const workspaceManager = require('../../../../component/workspace-manager');

const Facet = app.models.Facet;
app.on('booted', function() {
  app.emit('ready');
});

module.exports = function() {
  const testsuite = this;
  this.Given(/^that I have loaded the workspace$/, function(next) {
    workspaceManager.createWorkspace(testSupport.givenSandboxDir());
    next();
  });

  this.When(/^I create a facet '(.+)'$/,
  function(facetName, next) {
    const modelsMeta = {
      sources: [
        'loopback/common/models',
        'loopback/server/models',
        '../common/models',
        './models',
      ],
      mixins: [
        'loopback/common/mixins',
        'loopback/server/mixins',
        '../common/mixins',
        './mixins',
      ],
    };
    const config = {
      name: facetName,
      modelsMetadata: modelsMeta,
    };

    Facet.create(config, {}, function(err, data) {
      if (err) return next(err);
      delete config.id;
      testsuite.facetName = facetName;
      next();
    });
  });

  this.Then(/^the facet is created$/, function(next) {
    const workspace = workspaceManager.getWorkspace();
    const facet = workspace.getFacet(testsuite.facetName);
    expect(facet).to.not.to.be.undefined();
    const dir = facet.getPath();
    console.log(dir);
    fs.exists(dir, function(isExists) {
      expect(isExists).to.be.true();
    });
    next();
  });
};
