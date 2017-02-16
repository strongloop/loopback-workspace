'use strict';

module.exports = {
  // Verifications for the created artifacts
  verifyFacet: function(testsuite, templateName, cb) {
    testsuite.getFacet(templateName, function(err, fileList) {
      if (err) return cb(err);
      const expectedList = ['config.json', 'model-config.json'];
      testsuite.expect(fileList).to.include.members(expectedList);
      cb();
    });
  },
  verifyModelConfigs: function(testsuite, templateName, cb) {
    testsuite.getModelConfig(templateName, function(err, modelConfigs) {
      delete modelConfigs._meta;
      const template = testsuite.getTemplate(templateName);
      const expectedLength = template.server.modelConfigs.length;
      const givenLength = Object.keys(modelConfigs).length;
      testsuite.expect(givenLength).to.eql(expectedLength);
      cb();
    });
  },
  verifyDataSources: function(testsuite, templateName, cb) {
    const template = testsuite.getTemplate(templateName);
    testsuite.getDataSourceConfig(templateName, function(err, datasources) {
      if (err) return cb(err);
      const expectedDataSources = [];
      template.server.datasources.forEach(function(ds) {
        expectedDataSources.push(ds.name);
      });
      const givenDatasources = Object.keys(datasources);
      testsuite.expect(givenDatasources)
        .to.include.members(expectedDataSources);
      cb();
    });
  },
};
