'use strict';

const clone = require('lodash').clone;
const Collection = require('./collection');
const OrderedIterator = require('./ordered-iterator');

/**
 * @class OrderedSet
 *
 * Collection to hold an ordered set of nodes.
 */

class OrderedSet extends Collection {
  constructor(composite, nodes) {
    super(composite, nodes);
    this.order = [];
  }
  add(node, before, insertIndex) {
    this.nodes[node._name] = node;
    if (!insertIndex) insertIndex = -1;
    if (insertIndex && insertIndex < 0)
      insertIndex = this.order.length;
    if (insertIndex)
      insertIndex =
        insertIndex <= this.order.length ? insertIndex : this.order.length;
    if (before)
      this.order.find(function(value, i) {
        if (value.startsWith(before)) {
          insertIndex = i;
          return true;
        }
        return false;
      });
    if (insertIndex + 1 >= this.order.length)
      return this.order.push(node._name);
    this.order.splice(insertIndex, 0, node._name);
  }
  push(node, index, before) {
    this.add(node, index, before);
  }
  remove(node) {
    delete this.nodes[node._name];
    let index = -1;
    this.order.find(function(value, i) {
      if (value.startsWith(node._name)) {
        index = i;
        return true;
      }
      return false;
    });
    if (index < 0)
      throw new Error('node not found');
    this.order.splice(index, 1);
  }
  toArray() {
    const iterator = new OrderedIterator(this);
    const def = [];
    while (iterator.hasNext()) {
      def.push(iterator.next());
    };
    return def;
  }
  get values() {
    const iterator = new OrderedIterator(this);
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

    const iterator = new OrderedIterator(this);
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

    const iterator = new OrderedIterator(this);
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
      if (options.includeComponents === true && node.components)
        Object.keys(node.components).forEach(function(key) {
          let collection = node.components[key];
          let data = collection.map(options);
          Object.keys(data).forEach(function(leafName) {
            content[leafName] = data[leafName];
          });
        });
      if (options.json) {
        def[node._name] = content;
        continue;
      }
      def.push(content);
    }
    return def;
  }
}

module.exports = OrderedSet;
