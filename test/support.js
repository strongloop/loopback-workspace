var assert = require('assert');
var async = require('async');
var fs = require('fs-extra');
var path = require('path');
expect = require('chai').expect;
var workspace = require('../app');
var models = workspace.models;
var ConfigFile = models.ConfigFile;

expectFileExists = function (file) {
  assert(fs.existsSync(file), file + ' does not exist');
}

expectValueInJSONFile = function(file, propertyPath, val) {
  var contents = fs.readFileSync(file, 'utf8');
  var obj = JSON.parse(contents);
  expect(obj).to.have.deep.property(propertyPath, val);
}

SANDBOX = path.resolve(__dirname, 'sandbox/');

// tell the workspace to load files from the sandbox
process.env.WORKSPACE_DIR = SANDBOX;

givenEmptySandbox = function(cb) {
  fs.remove(SANDBOX, cb);

  // Remove any cached modules from SANDBOX
  for (var key in require.cache) {
    if (key.slice(0, SANDBOX.length) == SANDBOX)
      delete require.cache[key];
  }
}

resetWorkspace = function(cb) {
  async.each(workspace.models(), function(model, cb) {
    model.destroyAll(cb);
  }, cb);
}

givenFile = function(name, pathToFile) {
  return function(done) {
    var configFile = this[name] = new ConfigFile({
      path: pathToFile
    });
    configFile.load(done);
  }
}

givenEmptyWorkspace = function(cb) {
  resetWorkspace(function(err) {
    if(err) return cb(err);
    givenWorkspaceFromTemplate('empty', cb);  
  });
}

givenWorkspaceFromTemplate = function(template, cb) {
  givenEmptySandbox(function(err) {
    if(err) return cb(err);
    workspace.set('workspace dir', SANDBOX);
    workspace.models.Workspace.createFromTemplate(template, cb);
  });
}

function findOfType(name, type) {
  assert(name);
  assert(type);
  return function(query, cb) {
    var test = this;
    if(typeof query === 'function') {
      cb = query;
      query = {};
    }
    type.find(query, function(err, entities) {
      if(err) return cb(err);
      test[name] = entities;
      cb();
    });
  };
}

findAppDefinitions = findOfType('apps', models.AppDefinition);
findDataSourceDefinitions = findOfType('dataSources', models.DataSourceDefinition);
findModelDefinitions = findOfType('models', models.ModelDefinition);
findViewDefinitions = findOfType('views', models.ViewDefinition);
findModelProperties = findOfType('properties', models.ModelProperty);
findModelMethods = findOfType('methods', models.ModelMethod);
findModelRelations = findOfType('relations', models.ModelRelation);
findModelAccessControls = findOfType('accessControls', models.ModelAccessControl);
findPropertyValidations = findOfType('validations', models.PropertyValidation);
findDatabaseColumns = findOfType('columns', models.DatabaseColumn);

findAllEntities = function(cb) {
  var test = this;
  var steps = [
    findAppDefinitions,
    findDataSourceDefinitions,
    findModelDefinitions,
    findViewDefinitions,
    findModelProperties,
    findModelMethods,
    findModelRelations,
    findModelAccessControls,
    findPropertyValidations,
    findDatabaseColumns
  ];

  steps = steps.map(function(fn) {
    return fn.bind(test);
  });
  
  async.parallel(steps, cb);
}

toNames = function(arr) {
  return arr.map(function(entity) {
    return entity.name;
  });
}

// Let express know that we are runing from unit-tests
// This way the default error handler does not log
// errors to STDOUT
process.env.NODE_ENV = 'test';
