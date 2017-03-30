'use strict';
const clone = require('lodash').clone;
const Collection = require('./collection');
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
  contains(Entity, alias) {
    const className = Entity.name;
    this.addDomain(className);
    this[className.toLowerCase()] = getter(this, className);
    if (alias)
      this[alias] = getter(this, className);
  }
  add(child) {
    this.addNode(child.constructor.name, child);
  }
}

// return getter function for component nodes
function getter(graph, className) {
  return function(id) {
    const domain = graph._cache[className];
    return id ? domain[id] : new Collection(graph, domain);
  };
}

module.exports = Container;
