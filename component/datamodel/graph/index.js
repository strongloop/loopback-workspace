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
    var domain = node._domain;
    var name = node._name;
    this._cache[domain][name] = node;
  }
  getNode(domain, name) {
    return this._cache[domain][name];
  }
};
module.exports = Graph;
module.exports.Node = require('./node');
