var async = require('async');
var assert = require('assert');
var path = require('path');
var app = require('../app');
var fs = require('fs');
var debug = require('debug')('workspace:facet');
var extend = require('util')._extend;

var ModelDefinition = app.models.ModelDefinition;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ModelConfig = app.models.ModelConfig;
var ConfigFile = app.models.ConfigFile;
var PackageDefinition = app.models.PackageDefinition;
var FacetSetting = app.models.FacetSetting;

/**
 * Defines a `LoopBackApp` configuration.
 * @class Facet
 * @inherits Definition
 */

var Facet = app.models.Facet;

Facet.loadAllFromFs = function(cb) {
  // find facet files...
}

Facet.saveToFs = function(facetData, cb) {
  // mkdirp the facet dir
  // file = Facet.getConfigFile()
  // file.data = facetData
  // file.save(cb);
}

Facet.hasApp = function(facetData) {
  // At the moment, the common facet does not have `app.js`,
  // all other facets (server, client) have their app.js
  // In the future, we should create subclasses of the Facet (ServerFacet,...)
  // and override the value there.
  return facetData.name !== 'common';
};

Facet.getUniqueId = function(data) {
  return data.name || null;
}
