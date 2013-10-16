/*!
 * TODO: Description.
 */
var fs = require('fs');
var path = require('path');
var util = require('util');
var cpr = require('cpr');
var ModuleFactory = require('../../lib/factory');

/**
 * Creates a new instance of DocsExplorerFactory.
 */
function DocsExplorerFactory(root) {
  if (!(this instanceof DocsExplorerFactory)) {
    return new DocsExplorerFactory(root, __dirname);
  }

  ModuleFactory.call(this, root, __dirname);
}
util.inherits(DocsExplorerFactory, ModuleFactory);

/**
 * See ModuleFactory.render.
 */
DocsExplorerFactory.prototype.render = render;
function render(root, options, callback) {
  var self = this;

  self.renderer.renderAll(path.join(__dirname, 'template'), root, options, function (err) {
    if (err) {
      callback(err);
      return;
    }

    cpr(path.join(__dirname, 'explorer'), path.join(root, 'explorer'), {
      overwrite: true,
      confirm: true
    }, function (errs) {
      if (errs && errs.length) {
        callback(new Error('Failed to copy API Explorer.'));
        return;
      }

      callback();
    });
  });

  return self;
}

/*!
 * Export `DocsExplorerFactory`.
 */
module.exports = DocsExplorerFactory;
