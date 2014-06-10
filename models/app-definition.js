var app = require('../app');
var async = require('async');
var DataSourceDefinition = app.models.DataSourceDefinition;
var ModelDefinition = app.models.ModelDefinition;
var ViewDefinition = app.models.ViewDefinition;
var templates = require('../templates');
var availableTemplates = Object.keys(templates);

/**
 * Defines a `LoopBackApp` configuration.
 * @class AppDefinition
 * @inherits Definition
 */

var AppDefinition = app.models.AppDefinition;

/**
 * Load runtime only defined objects from the running app into the attached
 * `dataSource`.
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.prototype.loadFromRuntime = function(cb) {

}

/**
 * Load the app definition from a set of configuration files. The following
 * definitions will be loaded:
 *
 * - the app in the `app.name` directory
 * - any model definitions defined within the app's directory
 * - any datasource definitions defined within the app's directory
 * - any view definitions defined within the app's directory
 *
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.prototype.loadFromConfig = function(cb) {
  var rootDir = this.getDir();
  var env = app.get('env');

  // should delegate to loopback-boot's ConfigLoader
  // for each discovered app
    // load app config
    // load models
    // load datasources
    // load views
}

/**
 * Save the app definition to a set of configuration files. The following
 * definitions will be save:
 *
 * - the app in the `app.name` directory
 * - any model definitions defined within the app's directory
 * - any datasource definitions defined within the app's directory
 * - any view definitions defined within the app's directory
 *
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.prototype.saveToConfig = function(cb) {
  // (TBD) should delegate to loopback-boot's ConfigWriter (not yet created)
  // save app config
  // save models
  // save datasources
  // save views
}

/**
 * Load app definitions into the attached `dataSource` from the configured
 * `app.get('app dirs')`.
 *
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.loadApps = function(cb) {
  var dirs = app.get('app dirs');
  var apps = dirs.map(function(dir) {
    return new AppDefinition({
      name: dir
    });
  });

  async.waterfall([
    async.filter(apps, AppDefinition.exists, cb),
    loadApps
  ], cb);

  function loadApps(apps, cb) {
    async.each(apps, AppDefinition.load, cb);
  }
}

/**
 * Save all app definitions in the attached `dataSource` to config files.
 *
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.saveApps = function(cb) {
  async.waterfall([
    this.find.bind(this),
    saveApps
  ], cb);

  function saveApps(apps, cb) {
    async.each(apps, function(app, cb) {
      app.saveToConfig(cb);
    }, cb);
  }
}

/**
 * Does the given `app` exist on disk as a directory?
 *
 * @param {AppDefinition} app
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.exists = function(app, cb) {
  app.exists(cb);
}

/**
 * Does the given `app` exist on disk as a directory?
 *
 * @param {AppDefinition} app
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.prototype.exists = function(cb) {
  fs.stat(this.getDir(), function(err, stat) {
    if(err) return cb(err);
    cb(null, stat.isDirectory());
  });
}

/**
 * Alias for `app.loadFromConfig()`.
 *
 * @param {AppDefinition} app
 * @callback {Function} callback
 * @param {Error} err
 */

AppDefinition.load = function(app, cb) {
  app.loadFromConfig(cb);
}

/**
 * Get an array of available template names.
 *
 * @callback {Function} callback
 * @param {Error} err
 * @param {String[]} templateNames 
 */

AppDefinition.getAvailableTemplates = function(cb) {
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

AppDefinition.createFromTemplate = function(templateName, cb) {
  var template = templates[templateName];

  if(!template) {
    var err = new Error('Invalid template...');
    err.templateName = templateName;
    err.availableTemplates = availableTemplates;
    err.statusCode = 400;
    return cb(err);
  }

  var steps = [
    createApps,
    createDataSources,
    createModels,
    createViews
  ];

  async.parallel(steps, cb);

  function createApps(cb) {
    async.each(template.apps || [],
      AppDefinition.create.bind(AppDefinition), cb);
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

