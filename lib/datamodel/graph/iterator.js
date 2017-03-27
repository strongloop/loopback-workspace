'use strict';

/**
 * @class Iterator
 *
 * Iterator over a Collection of nodes.
 */

class Iterator {
  constructor(collection) {
    this.collection = collection;
    this.keys = Object.keys(this.collection.nodes);
    this.index = 0;
  }
  hasNext() {
    return this.index < this.keys.length;
  }
  next() {
    if (this.index >= this.keys.length)
      throw new Error('index out of bounds for given collection');
    const nextKey = this.keys[this.index++];
    return this.collection.get(nextKey);
  }
}

module.exports = Iterator;
