var app = require('../app');

/**
 * Defines a `DataSource` configuration.
 * @class DataSourceDefinition
 * @inherits Definition
 */

var DataSourceDefinition = app.models.DataSourceDefinition;

/**
 * - `name` must be unique per `AppDefinition`
 * - `name` and `connector` are required
 * 
 * @header Property Validation
 */

DataSourceDefinition.validatesUniquenessOf('name', { scopedTo: ['app'] });
DataSourceDefinition.validatesPresenceOf('name', 'connector');

/**
 * Test the datasource definition connection.
 *
 * @callback {Function} callback
 * @param {Error} err A connection or other error
 * @param {Boolean} success `true` if the connection was established
 */

DataSourceDefinition.prototype.testConnection = function(cb) {

}

/**
 * Get the schema for the given table / collection name.
 *
 * @param {String} name The collection / table name.
 * @callback {Function} callback
 * @param {Error} err
 * @param {DatabaseColumn[]} columns An array of columns
 */

DataSourceDefinition.prototype.getSchema = function(name, cb) {

}

/**
 * Discover model definitions available from this data source.
 *
 * @callback {Function} callback
 * @param {Error} err
 * @param {ModelDefinition[]} models An array of model definitions
 */

DataSourceDefinition.prototype.discoverModelDefinitions = function(cb) {

}
