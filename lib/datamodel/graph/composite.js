'use strict';
const clone = require('lodash').clone;
const Node = require('./node');

/**
 * @class Composite
 *
 * Pattern to allow a parent to hold multiple child nodes.
 */

class Composite extends Node {
  constructor(graph, domain, id, data) {
    super(graph, domain, id, data);
    this.children = {};
  }
  contains(Entity) {
    this.children[Entity.name] = {};
    this[Entity.name.toLowerCase()] = function(id) {
      if (id) return this.children[Entity.name][id];
      return this.children[Entity.name];
    };
  }
  add(child) {
    this.children[child.constructor.name][child._name] = child;
  }
}

module.exports = Composite;
