'use strict';

module.exports = function() {
  const testName = 'CreateFacet';
  let templateName;

  this.Given(/^that I have loaded the workspace '(.+)'$/,
  function(workspaceName, next) {
    templateName = workspaceName;
    next();
  });

  this.When(/^I create a facet '(.+)'$/,
  function(facetName, next) {
    const config = {
      name: facetName,
      modelsMetadata: this.getDefaultModelsMeta(),
    };
    const Facet = this.getApp().models.Facet;
    this.createModel(Facet, config, templateName, testName, next);
  });

  this.Then(/^the facet is created$/, function(next) {
    const inputs = this.getSavedInputs(testName);
    const facet = this.getWorkspace(templateName).getFacet(inputs.facetName);
    this.expect(facet).to.not.to.be.undefined();
    const dir = facet.getPath();
    this.checkFileExists(function(isExists) {
      this.expect(isExists).to.be.true();
      next();
    });
  });
};
