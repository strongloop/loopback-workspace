'use strict';
const clone = require('lodash').clone;
const Node = require('./node');
const Collection = require('./collection');

/**
 * @class Composite
 *
 * Pattern to allow a parent to hold multiple component nodes.
 */

class Composite extends Node {
  constructor(domain, id, data) {
    super(domain, id, data);
    this.components = {};
  }
  contains(Entity, alias) {
    const className = Entity.name;
    this.components[className] = new Collection(this);
    this[className.toLowerCase()] = getter(this, className);
    if (alias)
      this[alias] = getter(this, className);
  }
  add(component) {
    const className = component.constructor.name;
    const collection = this.components[className];
    if (!collection)
      throw new Error('Composite does not contain ' + className);
    collection.push(component);
  }
  remove(component) {
    const className = component.constructor.name;
    const collection = this.components[className];
    if (!collection)
      throw new Error('Composite does not contain ' + className);
    collection.delete(component);
  }
  clone(options) {
    const self = this;
    const cloneClass = self.constructor;
    let cloneObj = new cloneClass;
    cloneObj._name = clone(self._name);
    cloneObj._content = clone(self._content);
    cloneObj._domain = clone(self._domain);
    cloneObj._outboundLinks = clone(self._outboundLinks);
    cloneObj._inboundLinks = clone(self._inboundLinks);
    if (self.config)
      cloneObj.config = clone(self.config);
    if (self.options)
      cloneObj.options = clone(self.options);
    Object.keys(self.components).forEach(function(key) {
      let collection = self.components[key];
      cloneObj.components[key] = collection.clone();
    });
    return cloneObj;
  }
}

// return getter function for component nodes
function getter(obj, className) {
  return function(id) {
    const collection = obj.components[className];
    return id ? collection.get(id) : collection;
  };
}

module.exports = Composite;
