'use strict';

const async = require('async');
const fs = require('fs-extra');
const ModelConfig = require('./datamodel/model-config');
const path = require('path');

class TemplateHandler {
  static createFromTemplate(workspace, template, callback) {
    const tasks = [];
    const self = this;
    if (template.files) {
      const templateFiles = TemplateHandler.getTemplateFiles(template);
      templateFiles.forEach(function(dir) {
        tasks.push(function(next) {
          TemplateHandler.copyTemplateDir(
          dir,
          workspace.getDirectory(),
          next);
        });
      });
    }
    const afterCopy = (function(err) {
      if (err) return callback(err);
      workspace.loadAll((function(err) {
        if (err) return callback(err);
        self.configureWorkspace(workspace, template, callback);
      }));
    });
    async.series(tasks, afterCopy);
  }
  static configureWorkspace(workspace, template, callback) {
    const taskList = [];
    if (template.package) {
      TemplateHandler.addTask(
        taskList,
        workspace,
        workspace.addPackageDefinition,
        [template.package]);
    }
    ['server', 'client'].forEach(function(facetName) {
      TemplateHandler.addFacet(taskList, facetName, workspace, template);
    });
    workspace.execute(taskList, callback);
  }
  static addFacet(taskList, facetName, workspace, template) {
    const facet = template[facetName];
    if (!facet) return;
    const config = {
      name: facetName,
      modelsMetadata: facet.modelsMetadata,
      settings: facet.config,
    };
    TemplateHandler.addTask(
      taskList,
      workspace,
      workspace.addFacet,
      [facetName, config]);
    TemplateHandler.addArtifacts(taskList, facet, facetName, workspace);
  }
  static addArtifacts(taskList, facet, facetName, workspace) {
    if (facet.datasources) {
      facet.datasources.forEach(function(datasource) {
        taskList.push(function(next) {
          workspace.addDataSource(datasource.name, datasource, next);
        });
      });
    }
    if (facet.modelConfigs) {
      facet.modelConfigs.forEach(function(config) {
        taskList.push(function(next) {
          let modelConfig =
            new ModelConfig(workspace, config.name, config);
          modelConfig.create(
            config.name,
            facetName,
            next);
        });
      });
    }
    if (facet.middleware) {
      facet.middleware.forEach(function(middleware) {
        taskList.push(function(next) {
          let configData = Object.assign({}, middleware);
          let phase = configData.phase;
          let subPhase = configData.subPhase;
          phase = (subPhase) ? phase + ':' + subPhase : phase;
          let path = configData.function;
          delete configData.phase;
          delete configData.subPhase;
          workspace.addMiddleware(phase, path, configData, next);
        });
      });
    }
  }
  static addTask(list, object, fn, args) {
    list.push(function(next) {
      args.push(next);
      fn.apply(object, args);
    });
  }
  static copyTemplateDir(dir, destinationPath, cb) {
    const options = {clobber: true};
    fs.copy(dir, destinationPath, options, cb);
  }
  static getTemplateFiles(template) {
    const templateFiles = [];
    if (template.dirList) {
      template.dirList.forEach(function(dir) {
        let filePath = path.join(__dirname,
          '../templates/files', dir);
        templateFiles.push(filePath);
      });
    }
    let filePath = path.join(__dirname,
      '../templates/files',
      template.files.path);
    templateFiles.push(filePath);
    return templateFiles;
  }
}

module.exports = TemplateHandler;
