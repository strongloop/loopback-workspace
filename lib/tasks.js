'use strict';
const config = require('./config');
const DataSource = require('./datamodel/datasource');
const Facet = require('./datamodel/facet');
const fsUtility = require('./util/file-utility');
const lodash = require('lodash');
const Model = require('./datamodel/model');
const ModelConfig = require('./datamodel/model-config');
const ModelMethod = require('./datamodel/model-method');
const ModelProperty = require('./datamodel/model-property');
const MiddlewarePhase = require('./datamodel/middleware-phase');
const PackageDefinition = require('./datamodel/package-definition');
const path = require('path');

/**
 * @class Tasks
 *
 * Atomic tasks that link the in-memory graph with create/update/delete workspace operations.
 * Every task can be performed using a processor.
 */
class Tasks {
  addModelRelation(relationName, fromModelId, toModelId, data, cb) {
    const workspace = this;
    const model = workspace.model(fromModelId);
    const relation = model.addRelation(relationName, toModelId, data);
    fsUtility.writeModel(model, cb);
  }
  addPackageDefinition(definition, cb) {
    const packageDef = new PackageDefinition(this, 'package.json', definition);
    fsUtility.writePackageDefinition(packageDef, cb);
  }
  removeModelRelation(modelId, relationName, cb) {
    const workspace = this;
    const model = workspace.model(modelId);
    model.removeRelation(relationName);
    fsUtility.writeModel(model, cb);
  }
};

module.exports = Tasks;
