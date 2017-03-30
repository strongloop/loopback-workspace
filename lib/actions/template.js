'use strict';

const async = require('async');
const DataSource = require('../datamodel/datasource');
const Facet = require('../datamodel/facet');
const fs = require('fs-extra');
const fsUtility = require('../util/file-utility');
const mixin = require('../util/mixin');
const ModelConfig = require('../datamodel/model-config');
const Middleware = require('../datamodel/middleware');
const Workspace = require('../workspace');
const path = require('path');

class TemplateActions {
  createFromTemplate(template, callback) {
    const workspace = this;
    const self = this;
    const tasks = [];
    if (template.files) {
      const templateFiles = getTemplateFiles(template);
      templateFiles.forEach(function(dir) {
        tasks.push(function(next) {
          workspace.copyTemplateDir(
          dir,
          workspace.getDirectory(),
          next);
        });
      });
      if (template.package) {
        tasks.push(function(next) {
          workspace.addPackageDefinition(template.package, next);
        });
      }
    }
    const afterCopy = (function(err) {
      if (err) return callback(err);
      workspace.loadAll((function(err) {
        if (err) return callback(err);
        self.configureWorkspace(template, callback);
      }));
    });
    async.series(tasks, afterCopy);
  }
  configureWorkspace(template, callback) {
    const workspace = this;
    const tasks = [];
    ['server', 'client'].forEach(function(facetName) {
      const facetConfig = template[facetName];
      if (!facetConfig) return;
      tasks.push(function(next) {
        workspace.addFacet(facetName, facetConfig, next);
      });
    });
    async.series(tasks, callback);
  }
  addFacet(facetName, facetConfig, cb) {
    const workspace = this;
    const taskList = [];
    const facet = new Facet(workspace, facetName, facetConfig.modelsMetaData);
    taskList.push(facet.create.bind(facet, facetConfig.config));
    if (facetConfig.datasources) {
      facetConfig.datasources.forEach(function(ds) {
        let datasource = new DataSource(workspace, ds.name, ds);
        taskList.push(datasource.create.bind(datasource, facetName));
      });
    }
    if (facetConfig.modelConfigs) {
      facetConfig.modelConfigs.forEach(function(config) {
        let id = config.name;
        let modelId = config.modelId;
        let modelConfig =
            new ModelConfig(workspace, id, config);
        taskList.push(
          modelConfig.create.bind(modelConfig, facetName, modelId));
      });
    }
    if (facetConfig.middleware) {
      facetConfig.middleware.forEach(function(middleware) {
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
    workspace.execute(taskList, cb);
  }
  copyTemplateDir(dir, destinationPath, cb) {
    const options = {clobber: true};
    fs.copy(dir, destinationPath, options, cb);
  }
}

function getTemplateFiles(template) {
  const templateFiles = [];
  if (template.dirList) {
    template.dirList.forEach(function(dir) {
      let filePath = path.join(__dirname,
        '../../templates/files', dir);
      templateFiles.push(filePath);
    });
  }
  let filePath = path.join(__dirname,
    '../../templates/files',
    template.files.path);
  templateFiles.push(filePath);
  return templateFiles;
}

mixin(Workspace.prototype, TemplateActions.prototype);
