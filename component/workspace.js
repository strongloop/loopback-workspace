'use strict';
var Graph = require('./datamodel/graph');
var Tasks = require('./tasks.js');

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
    var model = this.getNode('ModelDefinition', modelId);
    return model._content;
  }
  getDataSource(id) {
    var ds = this.getNode('DataSource', id);
    return ds._content;
  }
};

function mixin(target, source) {
  var attributes = Object.getOwnPropertyNames(source);
  attributes.forEach(function(ix) {
    if (typeof source[ix] === 'function') {
      var mx = source[ix];
      target[ix] = mx;
    }
  });
}

module.exports = Workspace;
