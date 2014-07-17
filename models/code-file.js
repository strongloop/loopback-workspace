var assert = require('assert');
var loopback = require('loopback');
var app = require('../app');
var ejs = require('ejs');
var path = require('path');
var async = require('async');
var fs = require('fs-extra');
var glob = require('glob');
var ROOT_COMPONENT = '.';
var groupBy = require('underscore').groupBy;
var debug = require('debug')('workspace:code-file');

// Use fs.read to ensure we get exactly what is in the JSON file
// Some module is using `require('../models.json')` and changing
// the content of the object afterwards (loopback-boot's executor ?)
var models = fs.readJsonFileSync(require.resolve('../models.json'));

/**
 * Various definitions in the workspace are backed by a `CodeFile`.
 * This class provides a very simple abstraction from the `fs` module,
 * to make working with code files simpler throughout the workspace.
 * 
 * @property {String} path Workspace relative path to the code file
 * @property {String} content Content of the file as a string
 * @property {String} template Name of the template used to render a generated
 * file
 * 
 * @class CodeFile
 * @inherits Model
 */

var CodeFile = app.models.CodeFile;

/**
 * Initialize and save a code file.
 */

CodeFile.create = function(obj, cb) {
  var codeFile = new CodeFile(obj);
  codeFile.save(cb);
}

/**
 * Render the provided data using the configured `template`. 
 */

CodeFile.prototype.render = function(data, cb) {
  var file = this;
  var templatePath = path.join(__dirname, '..', 'templates',
    'code', this.template + '.ejs');

  ejs.renderFile(templatePath, data, function(err, result) {
    if(err) return cb(err);
    file.content = result;
    file.save(cb);
  });
}

/**
 * Load and parse the data in the file. If a file does not exist,
 * the `data` property will be null.
 */

CodeFile.prototype.load = function(cb) {
  var codeFile = this;
  if(!this.path) return cb(new Error('no path specified'));
  var absolutePath = CodeFile.toAbsolutePath(this.path);
  async.waterfall([
    codeFile.exists.bind(codeFile),
    load,
    setup
  ], cb);

  function load(exists, cb) {
    if(exists) {
      fs.readFile(absolutePath, function(err, data) {
        if (err && err.name === 'SyntaxError') {
          err.message = 'Cannot parse ' + codeFile.path + ': ' + err.message;
        }
        cb(err, err ? undefined : data);
      });
    } else {
      cb(null, null);
    }
  }

  function setup(data, cb) {
    debug('loaded [%s] %j', codeFile.path, data);
    codeFile.data = data || {};
    cb();
  }
}

/**
 * Stringify and save the data to a file.
 *
 * @callback {Function} callback
 * @param {Error} err
 */

CodeFile.prototype.save = function(cb) {
  var codeFile = this;
  if(!this.path) return cb(new Error('no path specified'));
  var absolutePath = codeFile.getAbsolutePath();
  codeFile.data = codeFile.data || {};

  debug('output [%s] %j', absolutePath, codeFile.data);
  fs.mkdirp(path.dirname(absolutePath), function(err) {
    if(err) return cb(err);
    fs.writeFile(absolutePath, codeFile.content || '', cb);
  });
}

/**
 * Does the code file exist at `codeFile.path`?
 *
 * @callback {Function} callback
 * @param {Error} err
 * @param {Boolean} exists
 */

CodeFile.prototype.exists = function(cb) {
  fs.exists(this.getAbsolutePath(), function(exists) {
    cb(null, exists);
  });
}

/**
 * Get the path to the workspace directory. First check the env
 * variable `WORKSPACE_DIR`. Otherwise default to `process.cwd()`.
 *
 * @returns {String}
 */

CodeFile.getWorkspaceDir = function() {
  return process.env.WORKSPACE_DIR || process.cwd();
}

/**
 * Resolve the relative workspace path to a fully qualified
 * absolute file path.
 *
 * @param {String} relativePath
 * @returns {String}
 */

CodeFile.toAbsolutePath = function(relativePath) {
  return path.join(CodeFile.getWorkspaceDir(), relativePath);
}

/**
 * See: CodeFile.getAbsolutePath()
 */

CodeFile.prototype.getAbsolutePath = function() {
  return CodeFile.toAbsolutePath(this.path);
}

CodeFile.prototype.getExtension = function() {
  return path.extname(this.path);
}

CodeFile.prototype.getDirName = function() {
  return path.basename(path.dirname(this.path));
}

CodeFile.prototype.getFacetName = function() {
  var dir = this.getDirName();
  var baseDir = this.path.split(path.sep)[0];

  if(dir === ROOT_COMPONENT
    || baseDir === this.path
    || baseDir === 'models') {
    return ROOT_COMPONENT;
  } else {
    return baseDir;
  }
}
