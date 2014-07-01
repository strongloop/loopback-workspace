var fs = require('fs');
var ncp = require('ncp');
var path = require('path');
var app = require('../app');
var async = require('async');
var PackageDefinition = app.models.PackageDefinition;
var ConfigFile = app.models.ConfigFile;
var ComponentDefinition = app.models.ComponentDefinition;
var ComponentModel = app.models.ComponentModel;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ModelDefinition = app.models.ModelDefinition;
var ModelRelation = app.models.ModelRelation;
var ViewDefinition = app.models.ViewDefinition;
var TEMPLATE_DIR = path.join(__dirname, '..', 'templates');
var DEFAULT_TEMPLATE = 'api-server';
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
  fs.readdir(TEMPLATE_DIR, cb);
}

Workspace.addComponent = function(options, cb) {
  var template;
  var templateName = options.template || DEFAULT_TEMPLATE;
  var name = options.name || templateName;
  var packageName = options.packageName || name;
  if(options.root) name = '.';
  var fileTemplatesDir = path.join(TEMPLATE_DIR, templateName, 'template');

  try {
    template = require('../templates/' + templateName + '/component');
    // create a clone to preserve the original
    template = JSON.parse(JSON.stringify(template));
  } catch(e) {
    console.error(e);
  }
  
  debug('create from template [%s]', templateName);

  if(!template) {
    var err = new Error('Invalid template...');
    err.templateName = templateName;
    err.statusCode = 400;
    return cb(err);
  }

  var dest = path.join(ConfigFile.getWorkspaceDir(), name);
  var config = template.config;
  var subComponents = config && config.components;
  var steps = [];

  if(template.component) {
    steps.push(function(cb) {
      template.component.name = name;
      ComponentDefinition.create(template.component, cb);
    });
    if(subComponents) {
      steps.push(function(cb) {
        async.each(subComponents, function(component, cb) {
          Workspace.addComponent({
            name: component,
            template: component
          }, cb);
        }, cb);
      });
    }
  } else {
    return cb(new Error('invalid template: does not include "component"'));
  }

  if(template.package) {
    template.package.name = packageName;
    setComponentName(template.package);
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

  steps.push(function(cb) {
    fs.exists(fileTemplatesDir, function(exists) {
      if(exists) {
        ncp(fileTemplatesDir, dest, cb);
      } else {
        cb();
      }
    });
  });

  function setComponentName(obj) {
    if(Array.isArray(obj)) {
      obj.forEach(function(item) {
        item.componentName = name;
      });
    } else if(obj) {
      obj.componentName = name;
    }
  }

  async.parallel(steps, cb);
}

/**
 * In the attached `dataSource`, create a set of app definitions and
 * corresponding workspace entities using the given template.
 *
 * @param {String} templateName
 * @callback {Function} callback
 * @param {Error} err
 */

Workspace.createFromTemplate = function(templateName, name, cb) {
  Workspace.addComponent({
    root: true,
    name: name,
    template: templateName
  }, cb);
}

/**
 * @typedef {{name, description,supportedByStrongLoop}} ConnectorMeta
 */

/**
 * @type {Array.<ConnectorMeta>}
 * @internal
 */
var staticConnectorList = require('../available-connectors');

/**
 * List of connectors available on npm.
 * @param {function(Error=,Array.<ConnectorMeta>=)} cb
 */
Workspace.listAvailableConnectors = function(cb) {
  cb(null, staticConnectorList);
};

/**
 * Check if the project is a valid directory.
 * The callback is called with no arguments when the project is valid.
 * @param {function(Error=)} cb
 */
Workspace.isValidDir = function(cb) {
  // Every call of `Model.find()` triggers reload from the filesystem
  // This allows us to catch basic errors in config files
  ComponentDefinition.find(function(err, list) {
    if (err) {
      cb(err);
    } else if (!list.length) {
      cb(new Error('Invalid workspace: no components found.'));
    } else {
      // TODO(bajtos) Add more sophisticated validation based on component types
      cb();
    }
  });
};
