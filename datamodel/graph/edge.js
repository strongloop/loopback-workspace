'use strict';

/**
 * @class Edge
 *
 * Edge to represent a relationship.
 */
class Edge {
  constructor(fromNode, toNode, attributes) {
    this._from = fromNode;
    this._to = toNode;
    this._attributes = attributes;
    fromNode._outboundLinks[toNode._name] = this;
    toNode._inboundLinks[fromNode._name] = this;
  }
  getOriginatingNode() {
    return this._from;
  }
  getEndingNode() {
    return this._to;
  }
  remove() {
    delete this._from._outboundLinks[this._to._name];
    delete this._to._inboundLinks[this._from._name];
  }
};

module.exports = Edge;
