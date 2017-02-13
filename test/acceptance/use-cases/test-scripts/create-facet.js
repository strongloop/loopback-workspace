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
  this.Given(/^that I have loaded the workspace '(.+)'$/,
  function(workspaceName, next) {
    this.setup(workspaceName);
    next();
  });

  this.When(/^I create a facet '(.+)'$/,
  function(facetName, next) {
    const config = {
      name: facetName,
      modelsMetadata: this.getDefaultModelsMeta(),
    };
    this.saveInputs(config);
    this.createModel(Facet, next);
  });

  this.Then(/^the facet is created$/, function(next) {
    const inputs = this.getSavedInputs();
    const facet = this.workspace.getFacet(inputs.facetName);
    expect(facet).to.not.to.be.undefined();
    const dir = facet.getPath();
    fs.exists(dir, function(isExists) {
      expect(isExists).to.be.true();
    });
    next();
  });
};
