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
  getContents(options) {
    const contents = clone(this._content);
    if (options && options.filter) {
      if (!Array.isArray(options.filter) &&
          !(typeof options.filter === 'string'))
        throw new Error('options.filter must be an array or string');

      if (typeof options.filter === 'string')
        options.filter = [options.filter];
      options.filter.forEach(function(fieldName) {
        delete contents[fieldName];
      });
    }
    return contents;
  }
  getOutboundLink(name) {
    return this._outboundLinks[name];
  }
  getInboundLink(name) {
    return this._inboundLinks[name];
  }
};

module.exports = Node;
