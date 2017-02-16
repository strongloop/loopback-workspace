'use strict';

module.exports = function() {
  const testName = 'LoadWorkspace';
  let templateName, modelId, modelConfig, ModelName;

  this.When(new RegExp(['^I change \'(.+)\' ',
    'facet Model Config property \'(.+)\' to \'(.+)\' ',
    'in workspace \'(.+)\' for model \'(.+)\'$'].join('')),
  function(facetName, fieldName, value, workspaceName, modelName, next) {
    templateName = workspaceName;
    ModelName = modelName;
    modelId = 'common.models.' + modelName;
    modelConfig = {
      facetName: facetName,
    };
    modelConfig[fieldName] = value;
    const ModelConfig = this.getApp().models.ModelConfig;
    this.updateAttributes(ModelConfig,
    modelId,
    modelConfig,
    templateName,
    testName,
    next);
  });

  this.Then(/^The model config json is updated$/, function(next) {
    const testsuite = this;
    this.getModelConfig(templateName, function(err, data) {
      if (err) return next(err);
      const config = data[ModelName];
      testsuite.expect(config).to.not.to.be.undefined();
      next();
    });
  });
};
