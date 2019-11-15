// Copyright IBM Corp. 2015,2017. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

const g = require('strong-globalize')();
const app = require('../../server/server');

module.exports = function(DataSourceDefinition) {
  app.once('ready', function() {
    ready(DataSourceDefinition);
  });
};

function ready(DataSourceDefinition) {
  const async = require('async');
  const ModelDefinition = app.models.ModelDefinition;
  const ModelConfig = app.models.ModelConfig;
  const ModelProperty = app.models.ModelProperty;
  const fork = require('child_process').fork;
  const loopback = require('loopback');
  const debug = require('debug')('workspace:data-source-definition');
  const ConfigFile = app.models.ConfigFile;

  /*
   TODOs

   - add a flag indicating if discover is supported

  */

  /**
   * Defines a `DataSource` configuration.
   * @class DataSourceDefinition
   * @inherits Definition
   */

  /**
   * - `name` must be unique per `Facet`
   * - `name` and `connector` are required
   * - `facetName` is required and must refer to an existing facet
   *
   * @header Property Validation
   */

  DataSourceDefinition.validatesUniquenessOf('name', {scopedTo: ['facetName']});
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
    this.invokeMethodInWorkspace('ping', function(err) {
      if (!err) {
        return cb(null, true);
      }

      if (err.origin === 'invoke') {
        // report `ping` errors as a 200 result with error details, not a 500
        cb(null, false, {
          message: err.message,
          code: err.code,
          details: err.details,
          stack: err.stack,
        });
      } else {
        cb(err);
      }
    });
  };

  loopback.remoteMethod(DataSourceDefinition.prototype.testConnection, {
    returns: [
      {arg: 'status', type: 'boolean'},
      {arg: 'error', type: 'object'},
    ],
  });

  /**
   * Test the datasource connection (static version).
   *
   * @deprecated Use the prototype version.
   *
   * @param {Object} data DataSourceDefinition
   * @callback {Function} callback
   * @param {Error} err A connection or other error
   * @param {Boolean} success `true` if the connection was established
   */
  DataSourceDefinition.testConnection = function(data, cb) {
    // A legacy implementation that runs the test in loopback-workspace process
    try {
      const dataSource = new DataSourceDefinition(data).toDataSource();
      dataSource.ping(function(err) {
        cb(err, !err);
      });
    } catch (err) {
      debug('Cannot connect to the data source.\nData: %j\nError: %s', data, err);

      // NOTE(bajtos) juggler ignores unknown connector and let the application
      // crash later, when a method of undefined connector is called
      // We have to build a useful error message ourselves

      return cb(
        new Error(g.f('Cannot connect to the data source.' +
          ' Ensure the configuration is valid and the connector is installed.')),
      );
    }
  };

  DataSourceDefinition.remoteMethod('testConnection', {
    accepts: {
      arg: 'data', type: 'DataSourceDefinition', http: {source: 'body'},
    },
    returns: {
      arg: 'status', type: 'boolean',
    },
    http: {verb: 'POST'},
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
    const self = this;
    cb = arguments[arguments.length - 1];

    if (typeof options === 'function') {
      cb = options;
      options = undefined;
    }

    if (typeof cb !== 'function') {
      cb = function getSchemaCallback(err) {
        if (err) console.error(err);
      };
    }

    if (!options) options = {};

    this._setDefaultSchema(options);
    this.invokeMethodInWorkspace('discoverSchema', name, options, function(err, result) {
      if (err) return cb(err);

      if (result.base || result.options.base)
        return cb(null, result);

      self.getDefaultBaseModel(function(err, baseModel) {
        if (err) return cb(err);
        if (baseModel)
          result.options.base = baseModel;
        cb(null, result);
      });
    });
  };

  loopback.remoteMethod(DataSourceDefinition.prototype.discoverModelDefinition, {
    accepts: [{
      arg: 'tableName', type: 'string', required: true,
    }, {
      arg: 'options', type: 'object',
    }],
    returns: {arg: 'status', type: 'boolean'},
  });

  DataSourceDefinition.prototype.getDefaultBaseModel = function(cb) {
    const connectorName = this.connector;
    DataSourceDefinition.app.models.Workspace.listAvailableConnectors(
      function(err, list) {
        if (err) return cb(err);
        const meta = list.filter(function(c) {
          return c.name === connectorName;
        })[0];
        return cb(null, meta && meta.baseModel);
      },
    );
  };

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
    cb = arguments[arguments.length - 1];

    if (typeof options === 'function') {
      cb = options;
      options = undefined;
    }

    if (typeof cb !== 'function') {
      cb = function getSchemaCallback(err) {
        if (err) console.error(err);
      };
    }

    if (!options) options = {};

    this._setDefaultSchema(options);

    this.invokeMethodInWorkspace('discoverModelDefinitions', options, cb);
  };

  loopback.remoteMethod(DataSourceDefinition.prototype.getSchema, {
    accepts: {arg: 'options', type: 'object'},
    returns: {arg: 'models', type: 'array'},
  });

  DataSourceDefinition.prototype._setDefaultSchema = function(options) {
    if (options && typeof options === 'object' && !options.schema) {
      switch (this.connector) {
        case 'loopback-connector-oracle':
        case 'oracle':
          options.schema = this.username;
          break;
        case 'loopback-connector-mysql':
        case 'mysql':
          options.schema = this.database;
          break;
        case 'loopback-connector-postgresql':
        case 'postgresql':
          options.schema = 'public';
          break;
        case 'loopback-connector-mssql':
        case 'mssql':
          options.schema = 'dbo';
          break;
      }
    }
  };

  /**
   * Run a migration on the data source. Creates indexes, tables, collections, etc.
   *
   * **NOTE: this will destroy any existing data**
   *
   * @param {string} modelName
   * @callback {Function} callback
   * @param {Error} err
   * @param {boolean} success
   */

  DataSourceDefinition.prototype.automigrate = function(modelName, cb) {
    this.invokeMethodInWorkspace('automigrate', modelName, cb);
  };

  loopback.remoteMethod(DataSourceDefinition.prototype.automigrate, {
    accepts: {arg: 'modelName', type: 'string'},
    returns: {arg: 'success', type: 'boolean'},
    http: {verb: 'POST'},
  });

  /**
   * Update existing tables / collections.
   *
   * @param {string} modelName
   * @callback {Function} callback
   * @param {Error} err
   * @param {boolean} success
   */

  DataSourceDefinition.prototype.autoupdate = function(modelName, cb) {
    this.invokeMethodInWorkspace('autoupdate', modelName, cb);
  };

  loopback.remoteMethod(DataSourceDefinition.prototype.autoupdate, {
    accepts: {arg: 'modelName', type: 'string'},
    returns: {arg: 'success', type: 'boolean'},
    http: {verb: 'POST'},
  });

  DataSourceDefinition.prototype.invokeMethodInWorkspace = function(methodName) {
    // TODO(bajtos) We should ensure there is never more than one instance
    // of this code running at any given time.
    let isDone = false;
    const self = this;
    const args = Array.prototype.slice.call(arguments, 0);
    let cb;
    const stdErrs = [];
    const invokePath = require.resolve('../../bin/datasource-invoke');

    // remove method name
    args.shift();

    if (typeof args[args.length - 1] === 'function') {
      cb = args.pop();
    } else {
      cb = function invokeComplete(err) {
        if (err) console.error(err);
      };
    }

    const child = fork(invokePath, [], {silent: true});
    child.stdout.pipe(process.stdout);

    // handle the callback message
    child.once('message', function(msg) {
      const err = msg.error;
      if (err) {
        return done(missingConnector(err) || err);
      }

      done.apply(self, msg.callbackArgs);
      child.kill();
    });

    child.stderr.on('data', storeErrors);

    child.on('exit', function(code) {
      if (code > 0) {
        done(new Error(stdErrs.join('')));
      }
    });

    // send the args as a message to the child
    child.send({
      dir: ConfigFile.getWorkspaceDir(),
      dataSourceName: this.name,
      methodName: methodName,
      args: args,
    });

    function done(err) {
      if (isDone && err) {
        g.error('Error calling %s after callback!', methodName);
        console.error(err);
        return;
      }

      child.stderr.removeListener('data', storeErrors);

      cb.apply(self, arguments);
      isDone = true;
    }

    function storeErrors(buf) {
      stdErrs.push(buf.toString());
    }

    function missingConnector(err) {
      if (err == null || typeof err.message !== 'string') {
        return undefined;
      }
      const match = err.message.match(
        /LoopBack connector "(.*)" is not installed/,
      );
      if (match && match[1] === self.connector) {
        const msg = g.f('Connector "%s" is not installed.', self.connector);
        err = new Error(msg);
        err.name = 'InvocationError';
        err.code = 'ER_INVALID_CONNECTOR';
        return err;
      }
      return undefined;
    }
  };

  /**
   * Create a `loopback.DataSource` object from the `DataSourceDefinition`.
   *
   * @returns {DataSource}
   */

  DataSourceDefinition.prototype.toDataSource = function() {
    return loopback.createDataSource(this.name, this);
  };

  /**
   * Create a `ModelDefinition` with the appropriate set of `ModelProperties` and
   * `ModelConfig` using the given `discoveredDef` object.
   *
   * @param {Object} discoveredDef The result of `dataSource.discoverModelDefinition()`.
   * @callback {Function} callback
   * @param {Error} err
   * @param {String} id The created `ModelDefinition` id
   */

  DataSourceDefinition.prototype.createModel = function(discoveredDef, cb) {
    const dataSourceDef = this;
    const properties = [];
    const propertyNames = Object.keys(discoveredDef.properties);
    const options = discoveredDef.options;
    let modelDefinition = {};
    let modelDefinitionId;

    // use common facet by default
    modelDefinition.facetName = 'common';
    modelDefinition.name = discoveredDef.name;

    // merge options
    Object.keys(options).forEach(function(option) {
      modelDefinition[option] = options[option];
    });

    // convert properties object to array
    propertyNames.forEach(function(propertyName) {
      const property = discoveredDef.properties[propertyName];
      property.name = propertyName;
      properties.push(property);
    });

    async.series([
      createModelDefinition,
      createProperties,
      createModelConfig,
    ], function(err) {
      if (err) return cb(err);
      cb(null, modelDefinition.id);
    });

    function createModelDefinition(cb) {
      ModelDefinition.create(modelDefinition, function(err, def) {
        if (err) return cb(err);
        modelDefinition = def;
        cb();
      });
    }

    function createProperties(cb) {
      async.each(properties, function(property, cb) {
        const data = ModelProperty.getDataFromConfig(property);
        modelDefinition.properties.create(data, cb);
      }, cb);
    }

    function createModelConfig(cb) {
      if (modelDefinition.public === undefined) {
        modelDefinition.public = true;
      }

      ModelConfig.create({
        dataSource: dataSourceDef.name,
        facetName: dataSourceDef.facetName,
        name: modelDefinition.name,
        public: modelDefinition.public,
      }, cb);
    }
  };

  loopback.remoteMethod(DataSourceDefinition.prototype.createModel, {
    accepts: {arg: 'discoveredDef', type: 'object',
      description: 'usually the result of discoverModelDefinition'},
    returns: {arg: 'modelDefinitionId', type: 'string'},
    http: {verb: 'POST'},
  });
}
