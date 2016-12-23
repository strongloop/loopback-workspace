'use strict';
const Graph = require('./datamodel/graph');
const Tasks = require('./tasks.js');

/**
 * @class Workspace
 *
 * Graph which acts as an in-memory data model of the workspace.
 * It represents all the artifacts as nodes and relation between the artifacts as links.
 */
class Workspace extends Graph {

  constructor(rootFolder) {
    super();
    this.directory = rootFolder;
    //mixin the atomic tasks with the workspace graph
    mixin(this, Tasks.prototype);
  }
  getModel(modelId) {
    const model = this.getNode('ModelDefinition', modelId);
    return model;
  }
  getDataSource(id) {
    const ds = this.getNode('DataSource', id);
    return ds;
  }
  getModelProperty(id) {
    const property = this.getNode('ModelProperty', id);
    return property;
  }
};

function mixin(target, source) {
  const attributes = Object.getOwnPropertyNames(source);
  attributes.forEach(function(ix) {
    if (typeof source[ix] === 'function') {
      const mx = source[ix];
      target[ix] = mx;
    }
  });
}

module.exports = Workspace;
