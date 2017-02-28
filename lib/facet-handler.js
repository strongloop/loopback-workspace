'use strict';
class FacetHandler {
  static createFacet(workspace, id, data, cb) {
    function create(next) {
      workspace.addFacet(id, data, next);
    };
    function callback(err, results) {
      if (err) return cb(err);
      cb(null, data);
    };
    const taskList = [create];
    workspace.execute(taskList, callback);
  }
}

module.exports = FacetHandler;
