'use strict';

module.exports = function() {
  const testName = 'CreateModelConfig';
  let templateName, modelId, ModelName;

  this.Given(/^that the model '(.+)' exists in workspace '(.+)'$/,
  function(modelName, workspaceName, next) {
    templateName = workspaceName;
    ModelName = modelName;
    modelId = 'common.models.' + modelName;
    const model = this.getWorkspace(templateName).model(modelId);
    this.expect(model).to.not.to.be.undefined();
    next();
  });

  this.When(/^I create a model config in facet '(.+)'$/,
  function(facetName, next) {
    const config = {
      id: ModelName,
      facetName: facetName,
      modelId: modelId,
      dataSource: 'db',
    };
    const ModelConfig = this.getApp().models.ModelConfig;
    this.createModel(ModelConfig, config, templateName, testName, next);
  });

  this.Then(/^the model configuration is created$/, function(next) {
    const testsuite = this;
    const config = this.getInputsToCompare(testName);
    this.getModelConfig(templateName, function(err, data) {
      if (err) return next(err);
      const storedConfig = data[ModelName];
      testsuite.expect(storedConfig.dataSource).to.not.to.be.undefined();
      testsuite.expect(storedConfig.dataSource).to.eql(config.dataSource);
      next();
    });
  });
};
