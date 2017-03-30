'use strict';
const config = require('../config.json');
const clone = require('lodash').clone;
const Entity = require('./entity');
const lodash = require('lodash');
const path = require('path');
const ModelRelation = require('./model-relationship');
const ModelMethod = require('./model-method');
const ModelProperty = require('./model-property');

/**
 * @class Model
 *
 * Represents a Model artifact in the Workspace graph.
 */
class Model extends Entity {
  constructor(Workspace, id, modelDef, options) {
    super(Workspace, 'Model', id, modelDef);
    this.config = {};
    this.options = options;
    this.contains(ModelMethod, 'methods');
    this.contains(ModelProperty, 'properties');
    this.contains(ModelRelation, 'relations');
  }
  getDefinition() {
    const model = this;
    const properties =
      model.properties().map({json: true, filter: ['id', 'modelId', 'name']});
    const methods =
      model.methods().map({json: true, filter: ['id', 'modelId']});
    const relations =
      model.relations().map({json: true, filter: ['id', 'modelId']},
      function(data) {
        let modelId = data.model;
        let parts = modelId.split('.');
        if (parts && parts.length > 2) {
          data.model = parts[parts.length - 1];
        }
      });
    const modelDef = model.getContents();
    modelDef.properties = properties;
    modelDef.methods = methods;
    modelDef.relations = relations;
    return modelDef;
  }
  getFilePath() {
    const modelDef = this._content;
    const filePath =
      path.join(this.getWorkspace().directory,
        modelDef.facetName,
        config.ModelDefaultDir,
        lodash.kebabCase(modelDef.name) + '.json');
    return filePath;
  }
  getFacetName() {
    const modelDef = this._content;
    return modelDef.facetName;
  }
  getName() {
    const modelDef = this._content;
    const name = modelDef.name;
    const parts = name.split('.');
    return parts[parts.length - 1];
  }
  removeRelation(relationName) {
    const model = this;
    const relation = model.relations(relationName);
    if (relation) {
      relation.remove();
      model.relations().remove(relation);
    }
  }
};

module.exports = Model;
