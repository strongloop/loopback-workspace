var app = require('../app');
var AppDefinition = app.models.AppDefinition;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ModelDefinition = app.models.ModelDefinition;
var ViewDefinition = app.models.ViewDefinition;
var templates = require('../templates');
var availableTemplates = Object.keys(templates);
var definitionTypes = [
  AppDefinition,
  DataSourceDefinition,
  ModelDefinition,
  ViewDefinition
];

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

AppDefinition.prototype.saveToConfig = function(cb) {
  // (TBD) should delegate to loopback-boot's ConfigWriter (not yet created)
  // save app config
  // save models
  // save datasources
  // save views
}

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

AppDefinition.exists = function(app, cb) {
  fs.stat(app.getDir(), function(err, stat) {
    if(err) return cb(err);
    cb(null, stat.isDirectory());
  });
}

AppDefinition.load = function(app, cb) {
  app.loadFromConfig(cb);
}

AppDefinition.getAvailableTemplates = function(cb) {
  cb(null, availableTemplates);
}

AppDefinition.prototype.applyTemplate = function(cb) {

}

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
