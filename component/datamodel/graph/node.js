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
  }
};

module.exports = Node;
