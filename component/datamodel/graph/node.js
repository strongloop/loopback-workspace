'use strict';

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
    this._outboundLinks = {};
    this._inboundLinks = {};
    this._contains = {};
  }
  addContainsRelation(node) {
    if (!this._contains[node._domain]) {
      this._contains[node._domain] = {};
    }
    this._contains[node._domain][node._name] = new Pointer(node);
  }
};

class Pointer {
  constructor(node) {
    this._graph = node._graph;
    this._domain = node._domain;
    this._name = node._name;
  }
  getNode() {
    return this._graph.getNode(this._domain, this._name);
  }
}

module.exports = Node;
