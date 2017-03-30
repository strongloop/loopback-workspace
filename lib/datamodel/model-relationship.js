'use strict';
const Relation = require('../datamodel/relation');
const fs = require('fs-extra');

/**
 * @class ModelRelation
 *
 * Represents a ModelRelation artifact in the Workspace graph.
 */
class ModelRelation extends Relation {
  constructor(workspace, id, data) {
    super(workspace, 'ModelRelation', id, data);
  }
};

module.exports = ModelRelation;
