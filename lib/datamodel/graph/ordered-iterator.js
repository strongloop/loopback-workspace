'use strict';

/**
 * @class OrderedIterator
 *
 * OrderedIterator over an ordered set.
 */

class OrderedIterator {
  constructor(collection) {
    this.collection = collection;
    this.order = this.collection.order;
    this.keys = Object.keys(this.collection.nodes);
    this.index = 0;
  }
  hasNext() {
    return this.index < this.order.length;
  }
  next() {
    if (this.index >= this.order.length)
      throw new Error('index out of bounds for given order');
    const self = this;
    const nextKey = self.order[self.index++];
    if (!this.collection.get(nextKey))
      throw new Error('order and node set do not match');
    return this.collection.get(nextKey);
  }
}

module.exports = OrderedIterator;
