'use strict';

const async = require('async');
const fs = require('fs-extra');
const DataSource = require('./datamodel/datasource');
const Facet = require('./datamodel/facet');
const ModelConfig = require('./datamodel/model-config');
const Middleware = require('./datamodel/middleware');
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
    const facetConfig = template[facetName];
    if (!facetConfig) return;
    const facet = new Facet(workspace, facetName, facetConfig.modelsMetaData);
    taskList.push(facet.create.bind(facet, facetConfig.config));
    TemplateHandler.addArtifacts(taskList, facetConfig, facetName, workspace);
  }
  static addArtifacts(taskList, facet, facetName, workspace) {
    if (facet.datasources) {
      facet.datasources.forEach(function(ds) {
        let datasource = new DataSource(workspace, ds.name, ds);
        taskList.push(datasource.create.bind(datasource));
      });
    }
    if (facet.modelConfigs) {
      facet.modelConfigs.forEach(function(config) {
        let modelConfig =
            new ModelConfig(workspace, config.name, config);
        taskList.push(
          modelConfig.create.bind(modelConfig, config.name, facetName));
      });
    }
    if (facet.middleware) {
      facet.middleware.forEach(function(middleware) {
        let configData = Object.assign({}, middleware);
        let phaseName = configData.phase;
        let subPhase = configData.subPhase;
        phaseName = (subPhase) ? phaseName + ':' + subPhase : phaseName;
        let path = configData.function;
        delete configData.phase;
        delete configData.subPhase;
        let middlewareObj = new Middleware(workspace, path, configData);
        taskList.push(
        middlewareObj.create.bind(middlewareObj, phaseName));
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
