/*!
 * The renderer module contains all template rendering needs for Projects and ModuleFactories.
 */
var fs = require('fs');
var path = require('path');
var async = require('async');
var debug = require('debug')('loopback:Renderer');
var findit = require('findit');
var hogan = require('hogan.js');
var mkdirp = require('mkdirp');

/**
 * Fills Mustache-style `template` with `data`.
 *
 * @param  {String} template The template to fill.
 * @param  {Object} data     The data to fill with.
 * @return {String}          The rendered output.
 */
function render(template, data) {
  return hogan.compile(template).render(data);
}

/**
 * Duplicates all files and folders in `from` at `to`, rendering all files along the way as templates. The `to`
 * directory need not exist, and will be created otherwise.
 *
 * @param  {String}   from     The full path to a directory containing source files and templates.
 * @param  {String}   to       The full path to a directory to write to.
 * @param  {Object}   options  The data to fill tempates with.
 * @param  {Function} callback An error-only callback.
 */
function renderAll(from, to, options, callback) {
  var operations = [];

  if (typeof options === 'function') {
    callback = options;
    options = {};
  }

  debug('Creating files in %s...', root);

  addDirectory(to);
  findit
    .find(from, { follow_symlinks: true })
    .on('directory', function (dir) {
      addDirectory(path.resolve(to, path.relative(from, dir)));
    })
    .on('file', function (file) {
      addFile(file, path.resolve(to, path.relative(from, file)));
    })
    .on('end', function () {
      async.series(operations, callback);
    });

  function addDirectory(dir) {
    debug('New directory: %s', dir);
    operations.push(function (cbMkdir) {
      mkdirp(dir, cbMkdir);
    });
  }

  function addFile(from, to) {
    debug('New file: %s', to);
    operations.push(function (cbRender) {
      async.waterfall([
        fs.readFile.bind(fs, from, 'utf8'),
        function (template, cbWrite) {
          fs.writeFile(to, render(template, options), cbWrite);
        }
      ], cbRender);
    });
  }
}

module.exports = {
  render: render,
  renderAll: renderAll
};
