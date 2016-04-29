// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var str = require('underscore.string');
var path = require('path');
var sh = require('shelljs');
var originalDir = path.join(__dirname, '..', '..');
var modelsFile = sh.cat(originalDir + '/models.json');
var models = JSON.parse(modelsFile);
var modelNames = Object.keys(models);
var modelConfig = {};
var modelFiles = modelNames.map(function(name) {
  var o = models[name];
  var base = o.options && o.options.base;

  modelConfig[name] = {
    public: o.public,
    dataSource: o.dataSource,
  };

  return;

  // if(base) {
  //   delete o.options.base;
  //   o.base = base;
  // }
  // var relations = o.options && o.options.relations;
  // if(relations) {
  //   delete o.options.relations;
  //   o.relations = relations;
  // }

  // if(o.options && Object.keys(o.options).length === 0) {
  //   delete o.options;
  // }

  // var fname = str.dasherize(name);

  // if(fname[0] === '-') fname = fname.substr(1, fname.length);

  // var dest = path.join(__dirname, 'common', 'models', fname);

  // var pathToSrc = originalDir + '/models/' + fname + '.js';

  // if(sh.test('-f', pathToSrc)) {

  //   var src = sh.cat(pathToSrc) || '';

  //   src = src.replace("require('../app');", name + '.app;');

  //   var tmpl = 'module.exports = function(' + name + ') {\n\n  ';

  //   tmpl += src.split('\n').join('\n  ');

  //   tmpl += '\n};';

  //   // tmpl.to(dest + '.js');
  // }
});

console.log(JSON.stringify(modelConfig, null, 2));
