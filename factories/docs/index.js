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
function DocsExplorerFactory() {
  if (!(this instanceof DocsExplorerFactory)) {
    return new DocsExplorerFactory();
  }

  ModuleFactory.call(this);
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

    console.log(root);
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

/**
 * See ModuleFactory.dependencies.
 */
DocsExplorerFactory.prototype.dependencies = dependencies;
function dependencies() {
  return {};
}

/*!
 * Export `DocsExplorerFactory`.
 */
module.exports = DocsExplorerFactory;
