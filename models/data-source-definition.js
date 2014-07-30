var app = require('../app');
var loopback = require('loopback');

/*
 TODOs
 
 - add a flag indicating if discover is supported
 
*/

/**
 * Defines a `DataSource` configuration.
 * @class DataSourceDefinition
 * @inherits Definition
 */

var DataSourceDefinition = app.models.DataSourceDefinition;

/**
 * - `name` must be unique per `Facet`
 * - `name` and `connector` are required
 * - `facetName` is required and must refer to an existing facet
 *
 * @header Property Validation
 */

DataSourceDefinition.validatesUniquenessOf('name', { scopedTo: ['facetName'] });
DataSourceDefinition.validatesPresenceOf('name', 'connector');
DataSourceDefinition.validatesPresenceOf('facetName');

/**
 * Test the datasource definition connection.
 *
 * @callback {Function} callback
 * @param {Error} err A connection or other error
 * @param {Boolean} success `true` if the connection was established
 */

DataSourceDefinition.prototype.testConnection = function(cb) {
  var dataSource = this.toDataSource();
  var timeout = DataSourceDefinition.settings.testConnectionTimeout || 60000;
  dataSource.once('connected', function() {
    clearTimeout(timer);
    cb(null, true);
  });
  dataSource.once('error', cb);
  var timer = setTimeout(function() {
    cb(new Error('connection timed out after ' + timeout + 'ms'));
  }, timeout);
  dataSource.connect();
}

loopback.remoteMethod(DataSourceDefinition.prototype.testConnection, {
  returns: { arg: 'status', type: 'boolean' }
});

/**
 * Discover the model definition by table name from this data source. Use the `name`
 * provided by items from returned from `DataSourceDefinition.getSchema()`.
 *
 * @param {String} modelName The model name (usually from `DataSourceDefinition.getSchema()`.
 * @options {Object} [options] Options; see below.
 * @property {String} owner|schema Database owner or schema name.
 * @property {Boolean} relations True if relations (primary key/foreign key) are navigated; false otherwise.
 * @property {Boolean} all True if all owners are included; false otherwise.
 * @property {Boolean} views True if views are included; false otherwise.
 */

DataSourceDefinition.prototype.discoverModelDefinition = function(name, options, cb) {
  this.toDataSource().discoverSchemas(name, options, cb);
}

loopback.remoteMethod(DataSourceDefinition.prototype.discoverModelDefinition, {
  accepts: [{
    arg: 'modelName', type: 'string'
  }, {
    arg: 'options', type: 'object'
  }],
  returns: { arg: 'status', type: 'boolean' }
});

/**
 * Get a list of table / collection names, owners and types.
 *
 * @param {Object} options The options
 * @param {Function} Callback function.  Optional.
 * @options {Object} options Discovery options.  See below.
 * @property {Boolean} all If true, discover all models; if false, discover only
 * models owned by the current user.
 * @property {Boolean} views If true, include views; if false, only tables.
 * @property {Number} limit Page size
 * @property {Number} offset Starting index
 * @callback {Function} callback
 * @param {Error} err
 * @param {ModelDefinition[]} models An array of model definitions
 */

DataSourceDefinition.prototype.getSchema = function(options, cb) {
  this.toDataSource().discoverModelDefinitions(options, cb);
}

loopback.remoteMethod(DataSourceDefinition.prototype.getSchema, {
  accepts: { arg: 'options', type: 'object'},
  returns: { arg: 'models', type: 'array' }
});

/**
 * Run a migration on the data source. Creates indexes, tables, collections, etc.
 *
 * **NOTE: this will destroy any existing data**
 *
 * @callback {Function} callback
 * @param {Error} err
 */

DataSourceDefinition.prototype.automigrate = function() {
  throw new Error('not implemented');
}

/**
 * Update existing tables / collections.
 *
 * @callback {Function} callback
 * @param {Error} err
 */

DataSourceDefinition.prototype.autoupdate = function() {
  throw new Error('not implemented');  
}

/**
 * Create a `loopback.DataSource` object from the `DataSourceDefinition`.
 *
 * @returns {DataSource}
 */

DataSourceDefinition.prototype.toDataSource = function() {
  return loopback.createDataSource(this.name, this);
}
