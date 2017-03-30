'use strict';
const clone = require('lodash').clone;

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
  set(values) {
    const data = this._content;
    Object.keys(values).forEach(function(key) {
      data[key] = values[key];
    });
  }
  getContents() {
    return clone(this._content);
  }
  getOutboundLink(name) {
    return this._outboundLinks[name];
  }
  getInboundLink(name) {
    return this._inboundLinks[name];
  }
  addContainsRelation(node) {
    if (!this._contains[node._domain]) {
      this._contains[node._domain] = {};
    }
    this._contains[node._domain][node._name] = new Pointer(node);
  }
  removeContainsRelation(node) {
    if (this._contains[node._domain]) {
      delete this._contains[node._domain][node._name];
    }
  }
  getContainedNode(domain, name) {
    const pointer = this._contains[domain][name];
    return pointer.getNode();
  }
  getContainedSet(domain) {
    const pointers = this._contains[domain];
    if (pointers) {
      const nodes = {};
      Object.keys(pointers).forEach(function(key) {
        let pointer = pointers[key];
        nodes[key] = pointer.getNode();
      });
      return nodes;
    }
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
