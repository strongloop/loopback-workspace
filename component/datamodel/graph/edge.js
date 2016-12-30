'use strict';

/**
 * @class Edge
 *
 * Edge to represent a relationship.
 */
class Edge {
  constructor(domain, name, fromNode, toNode, attributes) {
    const graph = fromNode._graph;
    this._from = fromNode;
    this._to = toNode;
    this._name = name;
    this._domain = domain;
    this._attributes = attributes;
    fromNode._outboundLinks[name] = this;
    toNode._inboundLinks[name] = this;
    graph._cache[domain][name] = this;
  }
};

module.exports = Edge;
