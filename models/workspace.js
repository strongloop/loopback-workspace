var path = require('path');
var app = require('../app');
var async = require('async');
var PackageDefinition = app.models.PackageDefinition;
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

Workspace.createFromTemplate = function(templateName, cb) {
  var template = templates[templateName];
  debug('create from template [%s]', templateName);

  if(!template) {
    var err = new Error('Invalid template...');
    err.templateName = templateName;
    err.availableTemplates = availableTemplates;
    err.statusCode = 400;
    return cb(err);
  }

  // add the root package
  var rootPackage = require('../templates/common/base-package')();

  // set the component as root
  rootPackage.component = '.';

  // set the root package name
  rootPackage.name = path.basename(process.env.WORKSPACE_DIR || process.cwd());

  // include all components to simplify app definition loading
  rootPackage.loopback.components = template.components.map(function(app) {
    return app.name;
  });

  // include the root package, others are allowed
  template.packages.push(rootPackage);

  var steps = [
    createPackages,
    createComponents,
    createDataSources,
    createModels,
    createViews
  ];

  async.parallel(steps, cb);

  function createPackages(cb) {
    async.each(template.packages || [],
      PackageDefinition.create.bind(PackageDefinition), cb);
  }

  function createComponents(cb) {
    async.each(template.components || [],
      ComponentDefinition.create.bind(ComponentDefinition), cb);
  }

  function createDataSources(cb) {
    async.each(template.datasources || [],
      DataSourceDefinition.create.bind(DataSourceDefinition), cb);
  }

  function createModels(cb) {
    async.each(template.models || [],
      ModelDefinition.create.bind(ModelDefinition), cb);
  }

  function createViews(cb) {
    async.each(template.views || [],
      ViewDefinition.create.bind(ViewDefinition), cb);
  }
}
