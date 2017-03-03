'use strict';
const config = require('../lib/config.json');
const clone = require('lodash').clone;
const Entity = require('./entity');
const lodash = require('lodash');
const path = require('path');
const ModelRelation = require('./model-relationship');

/**
 * @class Model
 *
 * Represents a Model artifact in the Workspace graph.
 */
class Model extends Entity {
  constructor(Workspace, id, modelDef, options) {
    super(Workspace, 'ModelDefinition', id, modelDef);
    this.config = {};
    this.options = options;
    Workspace.addNode(this);
  }
  setMethod(method) {
    this.addContainsRelation(method);
  }
  setProperty(property) {
    this.addContainsRelation(property);
  }
  setRelation(relation) {
    this.addContainsRelation(relation);
  }
  getMethod(methodName) {
    return this.getContainedNode(methodName);
  }
  getProperty(propertyName) {
    return this.getContainedNode(propertyName);
  }
  getRelation(relationName) {
    return this.getContainedNode(relationName);
  }
  getContents() {
    return clone(this._content);
  }
  getMethodDefinitions() {
    const model = this;
    const methodNodes = model.getContainedSet('ModelMethod');
    const methods = [];
    Object.keys(methodNodes).forEach(function(key) {
      let node = methodNodes[key];
      let def = clone(node._content);
      def.id = key;
      methods.push(def);
    });
    return methods;
  }
  getPropertyDefinitions() {
    const model = this;
    const propertyNodes = model.getContainedSet('ModelProperty');
    if (!propertyNodes) return;
    const properties = [];
    Object.keys(propertyNodes).forEach(function(key) {
      let node = propertyNodes[key];
      let def = clone(node._content);
      def.id = key;
      properties.push(def);
    });
    return properties;
  }
  getDefinition() {
    const model = this;

    const propertyNodes = model.getContainedSet('ModelProperty');
    const properties = {};
    if (propertyNodes) {
      Object.keys(propertyNodes).forEach(function(key) {
        const modelProperty = propertyNodes[key];
        const parts = key.split('.');
        const propertyName = parts[parts.length - 1];
        const def = clone(modelProperty._content);
        delete def.id;
        delete def.name;
        delete def.modelId;
        properties[propertyName] = def;
      });
    }

    const methodNodes = model.getContainedSet('ModelMethod');
    const methods = {};
    if (methodNodes) {
      Object.keys(methodNodes).forEach(function(key) {
        const modelMethod = methodNodes[key];
        const parts = key.split('.');
        const methodName = parts[parts.length - 1];
        methods[methodName] = modelMethod._content;
      });
    }

    const relationNodes = model.getContainedSet('ModelRelation');
    const relations = {};
    if (relationNodes) {
      Object.keys(relationNodes).forEach(function(key) {
        const modelRelation = relationNodes[key];
        const parts = key.split('.');
        const relationName = parts[parts.length - 1];
        relations[relationName] = modelRelation._content;
      });
    }
    const data = model._content;
    const modelDef = clone(data);
    modelDef.properties = properties;
    modelDef.methods = methods;
    modelDef.relations = relations;
    return modelDef;
  }
  updateDefinition(modelDef) {
    var modelData = clone(modelDef);
    delete modelData['properties'];
    delete modelData['methods'];
    delete modelData['relations'];
    delete modelData['validations'];
    delete modelData['acls'];
    this._content = modelData;
  }
  getFilePath() {
    const modelDef = this._content;
    const filePath = path.join(this._graph.directory, modelDef.facetName,
      config.ModelDefaultDir, lodash.kebabCase(modelDef.name) + '.json');
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
  addRelation(relationName, toModelId, data) {
    const workspace = this._graph;
    const id = this._name + '.' + relationName;
    const toModel = workspace.getModel(toModelId);
    data.model = toModel.getName();
    const relation = new ModelRelation(workspace, id, data, this, toModel);
    this.setRelation(relation);
    return relation;
  }
  remove() {
    const name = this._name;
    return this._graph.deleteNode(this._domain, name);
  }
};

module.exports = Model;
