'use strict';
const app = require('../server/server.js');
const connector = app.dataSources.db.connector;

/**
 * @class Connector
 *
 * Add DAO to models.
 */
connector.all = function(modelName, filter, options, cb) {
  const model = app.models[modelName];
  model.all(filter, options, cb);
};

connector.create = function(modelName, data, options, cb) {
  const model = app.models[modelName];
  model.createModel(data, options, cb);
};

connector.save = function(modelName, data, options, cb) {
  const model = app.models[modelName];
  model.create(data, options, cb);
};

connector.destroyAll = function(modelName, filter, options, cb) {
  const model = app.models[modelName];
  model.removeModel(data, options, cb);
};
