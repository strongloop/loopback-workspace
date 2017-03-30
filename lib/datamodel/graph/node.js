'use strict';
const clone = require('lodash').clone;

/**
 * @class Node
 *
 * Node to represent an entity.
 */
class Node {
  constructor(domain, name, data) {
    this._name = name;
    this._content = data;
    this._domain = domain;
    this._outboundLinks = {};
    this._inboundLinks = {};
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
};

module.exports = Node;
