'use strict';
class TemplateHandler {
  static createFromTemplate(workspace, template, callback) {
    const taskList = [];
    if (template.package) {
      taskList.push(function(next) {
        workspace.createPackage(template.package, next);
      });
    }

    ['server', 'client'].forEach(function(facetName) {
      const facet = template[facetName];
      if (!facet) return;
      const config = {
        name: facetName,
        modelsMetadata: facet.modelsMetadata,
      };
      taskList.push(function(next) {
        workspace.addFacet(facetName, config, next);
      });
      if (facet.datasources) {
        facet.datasources.forEach(function(datasource) {
          taskList.push(function(next) {
            workspace.addDataSource(datasource.id, datasource, next);
          });
        });
      }
      if (facet.modelConfigs) {
        facet.modelConfigs.forEach(function(modelConfig) {
          taskList.push(function(next) {
            workspace.addModelConfig(modelConfig.id, modelConfig, next);
          });
        });
      }
    });
    workspace.execute(taskList, callback);
  }
}

module.exports = TemplateHandler;
