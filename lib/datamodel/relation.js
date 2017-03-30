'use strict';
const Entity = require('./entity');
const Edge = require('./graph/edge');

/**
 * @class Relation
 *
 * Relation to represent a relationship.
 */
class Relation extends Entity {
  constructor(workspace, domain, id, data) {
    super(workspace, domain, id, data);
  }
  connect(from, to) {
    this.from = from;
    this.edge = new Edge(from, to);
    from.add(this);
  }
  remove() {
    this.edge.remove();
    delete this.edge;
  }
}

module.exports = Relation;
