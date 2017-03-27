'use strict';
const clone = require('lodash').clone;
const Iterator = require('./iterator');

/**
 * @class Collection
 *
 * Collection to hold multiple nodes.
 */

class Collection {
  constructor(nodes) {
    this.nodes = {};
    if (nodes)
      this.nodes = nodes;
  }
  push(node) {
    this.nodes[node._name] = node;
  }
  get(id) {
    return this.nodes[id];
  }
  toArray() {
    const iterator = new Iterator(this);
    const def = [];
    while (iterator.hasNext()) {
      def.push(iterator.next());
    };
    return def;
  }
  get values() {
    const iterator = new Iterator(this);
    const def = [];
    while (iterator.hasNext()) {
      let node = iterator.next();
      let content = clone(node._content);
      content.id = node._name;
      def.push(content);
    }
    return def;
  }
  map(options, filterFn) {
    if (options && options.filter) {
      if (!Array.isArray(options.filter) &&
          !(typeof options.filter === 'string'))
        throw new Error('options.filter must be an array or string');

      if (typeof options.filter === 'string')
        options.filter = [options.filter];
    }
    if (!options) {
      options = {};
    }

    const iterator = new Iterator(this);
    let def = [];
    if (options && options.json) {
      def = {};
    }
    while (iterator.hasNext()) {
      let node = iterator.next();
      let content = clone(node._content);
      content.id = node._name;
      if (options.filter) {
        options.filter.forEach(function(fieldName) {
          delete content[fieldName];
        });
      }
      if (filterFn) filterFn(content);
      if (options.json) {
        def[node._name] = content;
        continue;
      }
      def.push(content);
    }
    return def;
  }
}

module.exports = Collection;
