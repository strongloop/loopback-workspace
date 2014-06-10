var app = require('../app');
var async = require('async');
var DataSourceDefinition = app.models.DataSourceDefinition;
var ModelDefinition = app.models.ModelDefinition;
var ViewDefinition = app.models.ViewDefinition;
var templates = require('../templates');
var availableTemplates = Object.keys(templates);

/**
 * Groups related LoopBack applications.
 * @class Workspace
 * @inherits DataModel
 */

var Workspace = app.models.Workspace;
