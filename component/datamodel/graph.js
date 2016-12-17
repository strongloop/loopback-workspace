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

/**
 * @class Node
 *
 * Node to represent an entity.
 */
class Node {
  constructor(graph, domain, name, data) {
    this._graph = graph;
    this._name = name;
    this._content = data;
    this._domain = domain;
  }
};

exports.Graph = Graph;
exports.Node = Node;
