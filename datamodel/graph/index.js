'use strict';

/**
 * @class Graph
 *
 * Graph class to hold nodes and links.
 */
class Graph {
  constructor() {
    this._cache = {};
  }
  addDomain(name) {
    this._cache[name] = {};
  }
  addNode(node) {
    const domain = node._domain;
    const name = node._name;
    this._cache[domain][name] = node;
  }
  getNode(domain, name) {
    return this._cache[domain][name];
  }
  deleteNode(domain, name) {
    const node = this._cache[domain][name];
    if (node._inboundLinks && Object.keys(node._inboundLinks).length > 0) {
      return new Error('Integrity Constraint, cannot delete');
    }
    delete this._cache[domain][name];
  }
};
module.exports = Graph;
module.exports.Node = require('./node');
module.exports.Edge = require('./edge');
