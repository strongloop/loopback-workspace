'use strict';
const fs = require('fs-extra');

module.exports = function() {
  const testName = 'CreateProperty';
  let templateName, PropertyName, modelId, propertyDef;

  this.When(new RegExp(['^I add property \'(.+)\'',
    ' of type \'(.+)\' for model \'(.+)\'',
    ' in workspace \'(.+)\'$'].join('')),
    function(propertyName, type, modelName, workspaceName, next) {
      templateName = workspaceName;
      modelId = 'common.models.' + modelName;
      PropertyName = propertyName;
      propertyDef = {
        modelId: modelId,
        name: propertyName,
        type: type,
      };
      const ModelProperty = this.getApp().models.ModelProperty;
      this.createModel(ModelProperty,
      propertyDef,
      templateName,
      testName,
      function(err, data) {
        if (err) return next(err);
        next();
      });
    });

  this.Then(/^the model property is created$/, function(next) {
    const testsuite = this;
    const model = this.getWorkspace(templateName).getModel(modelId);
    const file = model.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const property = data &&
        data.properties &&
        data.properties[PropertyName];
      testsuite.expect(property).to.not.to.be.undefined();
      testsuite.expect({type: propertyDef.type}).to.eql(property);
      next();
    });
  });
};
