var ncp = require('ncp');
var path = require('path');
var app = require('../app');
var async = require('async');
var PackageDefinition = app.models.PackageDefinition;
var ConfigFile = app.models.ConfigFile;
var ComponentDefinition = app.models.ComponentDefinition;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ModelDefinition = app.models.ModelDefinition;
var ViewDefinition = app.models.ViewDefinition;
var templates = require('../templates');
var availableTemplates = Object.keys(templates);
var debug = require('debug')('workspace');

/**
 * Groups related LoopBack applications.
 * @class Workspace
 * @inherits Model
 */

var Workspace = app.models.Workspace;

/**
 * Get an array of available template names.
 *
 * @callback {Function} callback
 * @param {Error} err
 * @param {String[]} templateNames 
 */

Workspace.getAvailableTemplates = function(cb) {
  cb(null, availableTemplates);
}

/**
 * In the attached `dataSource`, create a set of app definitions and
 * corresponding workspace entities using the given template.
 *
 * @param {String} templateName
 * @callback {Function} callback
 * @param {Error} err
 */

Workspace.createFromTemplate = function(componentName, name, cb) {
  var template;
  var fileTemplatesDir = path.join(__dirname, '..', 'templates',
    componentName, 'template');

  try {
    template = require('../templates/' + componentName);
  } catch(e) {}
  
  debug('create from template [%s]', templateName);

  if(!template) {
    var err = new Error('Invalid template...');
    err.templateName = templateName;
    err.availableTemplates = availableTemplates;
    err.statusCode = 400;
    return cb(err);
  }

  var steps = [];

  if(template.component) {
    steps.push(function(cb) {
      ComponentDefinition.create(template.component, cb);
    });
    if(template.component.components) {
      steps.push(function(cb) {
        async.each(template.component.components, function(component, cb) {
          Workspace.createFromTemplate(component, component, cb);
        });
      });
    }
  } else {
    return cb(new Error('invalid template: does not include "component"'));
  }

  if(template.package) {
    template.package.componentName = template.component.name;
    steps.push(function(cb) {
      PackageDefinition.create(template.package, cb);
    });
  }

  if(template.componentModels) {
    setComponentName(template.componentModels);
    steps.push(function(cb) {
      async.each(template.componentModels, 
        ComponentModel.create.bind(ComponentModel), cb);
    });
  }

  if(template.models) {
    setComponentName(template.models);
    steps.push(function(cb) {
      async.each(template.models, 
        ModelDefinition.create.bind(ModelDefinition), cb);
    });
  }

  if(template.models) {
    setComponentName(template.models);
    steps.push(function(cb) {
      async.each(template.models, 
        ModelDefinition.create.bind(ModelDefinition), cb);
    });
  }

  if(template.datasources) {
    setComponentName(template.datasources);
    steps.push(function(cb) {
      async.each(template.datasources, 
        DataSourceDefinition.create.bind(DataSourceDefinition), cb);
    });
  }

  if(template.relations) {
    steps.push(function(cb) {
      async.each(template.relations, 
        ModelRelation.create.bind(ModelRelation), cb);
    });
  }

  if(template.relations) {
    steps.push(function(cb) {
      async.each(template.relations, 
        ModelRelation.create.bind(ModelRelation), cb);
    });
  }

  steps.push(function(cb) {
    fs.exists(fileTemplatesDir, function(exists) {
      if(exists) {
        steps.push(copyTemplateFiles);
        cb();
      } else {
        cb();
      }
    });
  });

  function copyTemplateFiles(cb) {
    var dest = path.join(ConfigFile.getWorkspaceDir(), template.component.name);
    ncp(fileTemplatesDir, dest, cb);
  }

  async.parallel(steps, cb);
}
