'use strict';
const fs = require('fs-extra');

module.exports = function() {
  const testName = 'CreateMethods';
  let modelMethod, templateName;

  this.Given(/^I add model method '(.+)' to model '(.+)' in workspace '(.+)'$/,
  function(methodName, modelname, workspaceName, next) {
    templateName = workspaceName;
    modelMethod = {accepts: [], returns: []};
    modelMethod.name = methodName;
    modelMethod.modelId = 'common.models.' + modelname;
    next();
  });

  this.When(/^the method has an argument '(.+)' type '(.+)'$/,
    function(name, type, next) {
      const argument = {arg: name, type: type};
      modelMethod.accepts.push(argument);
      next();
    });

  this.When(/^the method has a return parameter '(.+)' type '(.+)'$/,
    function(name, type, next) {
      const param = {arg: name, type: type};
      modelMethod.returns.push(param);
      next();
    });

  this.When(/^I call the model method api$/,
    function(next) {
      const ModelMethod = this.getApp().models.ModelMethod;
      this.createModel(ModelMethod, modelMethod, templateName, testName, next);
    });

  this.Then(/^the model method is created$/, function(next) {
    const testsuite = this;
    const model =
      this.getWorkspace(templateName).getModel(modelMethod.modelId);
    const file = model.getFilePath();
    fs.readJson(file, function(err, data) {
      if (err) return next(err);
      const method = data &&
        data.methods &&
        data.methods[modelMethod.name];
      testsuite.expect(method).to.not.to.be.undefined();
      testsuite.expect(modelMethod.accepts).to.eql(method.accepts);
      testsuite.expect(modelMethod.returns).to.eql(method.returns);
      next();
    });
  });
};
