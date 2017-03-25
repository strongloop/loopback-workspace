'use strict';
const clone = require('lodash').clone;
const Graph = require('./index');

/**
 * @class Container
 *
 * Container to create a tree.
 */

class Container extends Graph {
  constructor() {
    super();
  }
  contains(Entity) {
    this.addDomain(Entity.name);
    this[Entity.name.toLowerCase()] = function(id) {
      if (id) return this.getNode(Entity.name, id);
      return this._cache[Entity.name];
    };
  }
  add(child) {
    this._cache[child.constructor.name][child._name] = child;
  }
}

module.exports = Container;
