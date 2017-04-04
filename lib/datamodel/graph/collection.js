'use strict';
const clone = require('lodash').clone;
const Iterator = require('./iterator');

/**
 * @class Collection
 *
 * Collection to hold multiple nodes.
 */

class Collection {
  constructor(composite, nodes) {
    this.getComposite = function() {
      return composite;
    };
    this.nodes = {};
    if (nodes)
      this.nodes = nodes;
  }
  clone() {
    const self = this;
    const clone = self.constructor;
    let cloneObj = new clone;
    this.forEach(function(node) {
      cloneObj.push(node.clone());
    });
    return cloneObj;
  }
  push(node) {
    this.nodes[node._name] = node;
  }
  add(node) {
    this.nodes[node._name] = node;
  }
  remove(node) {
    delete this.nodes[node._name];
  }
  get(id) {
    return this.nodes[id];
  }
  set(data, instanceCreator) {
    const self = this;
    Object.keys(data).forEach(function(key) {
      let node = self.get(key);
      if (node)
        node.set(data[key]);
      else if (instanceCreator) {
        instanceCreator(self, key, data[key]);
      }  
    });
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
  forEach(applyFn) {
    if (!applyFn || typeof applyFn !== 'function')
      throw new Error('invalid apply function passed');

    const iterator = new Iterator(this);
    while (iterator.hasNext()) {
      let node = iterator.next();
      applyFn.call(this.getComposite(), node);
    }
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
