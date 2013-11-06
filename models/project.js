var app = require('../');
var fs = require('fs');
var Project = app.models.Project;
var Model = app.models.ModelDefinition;
var DataSource = app.models.DatasourceDefinition;
var path = require('path');
var async = require('async');
var assert = require('assert');
var DEFAULT_EXT = 'json';
var mkdirp = require('mkdirp');
var TEMPLATES = {
  empty: require('../templates/empty'),
  mobile: require('../templates/mobile')
};

// validation
Project.validatesUniquenessOf('name');
Project.validatesPresenceOf('name');

Project.loadFromFiles = function (dir, cb) {
  async.waterfall([
    function (cb) {
      loadConfigFilesWithExt(dir, 'json', cb);
    },
    function (projectConfig, cb) {
      Project.fromConfig(projectConfig, cb);
    }
  ], cb);
}

Project.prototype.saveToFiles = function (dir, cb) {
  async.waterfall([
    this.toConfig.bind(this),
    function (config, cb) {
      writeConfigToFiles(dir, DEFAULT_EXT, config, cb);
    }
  ], cb);
}

Project.prototype.toConfig = function(cb) {
  var project = this;
  var config = {
    name: this.name,
    app: this.app
  };

  async.parallel([
    findAndReduce('models'),
    findAndReduce('dataSources')
  ], function(err) {
    if(err) return cb(err);
    cb(null, config);
  });

  function findAndReduce(type) {
    return function(cb) {
      project[type](function(err, objects) {
        if(err) return cb(err);
        config[type] = objects.reduce(reduce, {});
        cb();
      });
    }
  }

  function reduce(prev, cur) {
    cur = prev[cur.name] = cur.toJSON();
    delete cur.id;
    delete cur.name;
    return prev;
  }
}

Project.configFiles = ['app', 'models', 'datasources'];
Project.appFiles = ['app.js', 'package.json'];
Project.supportedExtensions = ['json'];

Project.fromConfig = function (projectConfig, cb) {
  var project = new Project({name: projectConfig.name, app: projectConfig.app});
  var models = projectConfig.models;
  var dataSources = projectConfig.datasources;

  async.parallel([
    function(cb) {
      async.each(Object.keys(models), function (modelName, cb) {
        var model = new Model(models[modelName]);
        model.name = modelName;
        project.models.create(model, cb);
      }, cb);
    },
    function(cb) {
      async.each(Object.keys(dataSources), function (dsName, cb) {
        var ds = new DataSource(dataSources[dsName]);
        ds.name = dsName;
        project.dataSources.create(ds, cb);
      }, cb);
    }
  ], function(err) {
    if(err) return cb(err);
    cb(null, project);
  });
}

Project.createFromTemplate = function(dir, template, cb) {
  var config = TEMPLATES[template];

  if(!config) {
    return cb(new Error(template + ' is not a valid template'));
  }

  async.parallel([
    function(cb) {
      writeConfigToFiles(dir, DEFAULT_EXT, config, cb);
    },
    function(cb) {
      writeAppFiles(dir, config, cb);
    }
  ], cb)
}

Project.isValidProjectDir = function(dir, cb) {
  async.waterfall([
    function(cb) {
      fs.readdir(dir, cb);
    },
    function(contents) {
      var i;

      for(i = 0; i < Project.appFiles.length; i++) {
        var file = Project.appFiles[i];
        if(contents.indexOf(file) === -1) {
          return cb(null, false, 'expected ' + file + ' to exist');
        }
      }

      var fileIndex = contents.reduce(function(prev, cur) {
        var ext = path.extname(cur) || '';
        var isValidFile = ~Project.supportedExtensions.indexOf(ext.replace('.', ''));
        if(isValidFile) {
          prev[path.basename(cur).split('.')[0]] = {ext: ext};  
        }
        return prev;
      }, {});

      for(i = 0; i < Project.configFiles.length; i++) {
        var expectedFile = Project.configFiles[i];
        var info = fileIndex[expectedFile];

        if(!info) {
          console.log('expected', expectedFile, contents, fileIndex);

          cb(null, false, 'expected ' + expectedFile + ' config file to exist');
          return;
        }
      }

      cb(null, true, null);
    }
  ], cb);
}

Project.listTemplates = function() {
  return Object.keys(TEMPLATES).map(function(name) {
    return {
      name: name,
      description: TEMPLATES[name].description
    }
  });
}

function loadConfigFilesWithExt(dir, ext, cb) {
  assert(ext, 'cannot load config files without extension');
  var result = {name: path.basename(dir)};
  var filePaths = Project.configFiles.map(function (file) {
    return path.join(dir, file + '.' + ext);
  });

  async.map(filePaths, readJSONFile, function (err, configs) {
    if(err) return cb(err);
    
    var result = configs.reduce(function (prev, cur, i) {
      prev[Project.configFiles[i]] = cur;
      return prev;
    }, {});
    
    cb(null, result);
  });
}

function readJSONFile(filePath, cb) {
  async.waterfall([
    fs.readFile.bind(fs, filePath),
    function (str, cb) {
      var obj;
      try {
        obj = JSON.parse(str);
      } catch(e) {
        return cb(e);
      }
      cb(null, obj);
    }
  ], cb);
}

function writeConfigToFiles(dir, ext, config, cb) {
  var result = {};
  var files = Object.keys(config);

  async.series([
    function(cb) {
      mkdirp(dir, cb);
    },
    function(cb) {
      async.each(files, function(file, cb) {
        var fileConfig = config[file];
        file = file.toLowerCase();
        if(Project.configFiles.indexOf(file) === -1) {
          // skip non config file keys
          return cb();
        }
        fs.writeFile(path.join(dir, file + '.' + ext), stringify(fileConfig, ext), 'utf8', cb);
      }, cb);
    }
  ], cb);
}

function writeAppFiles(dir, config, cb) {
  async.waterfall([
    function(cb) {
      fs.readFile(path.join(__dirname, '..', 'templates', 'app.js'), 'utf8', cb);
    },
    function(appTemplateStr, cb) {
      fs.writeFile(path.join(dir, 'app.js'), appTemplateStr, 'utf8', cb);
    },
    function(cb) {
      mkdirp(path.join(dir, 'models'), cb);
    },
    function(modelDir, cb) {
      writePackage(dir, config, cb);
    }
  ], cb);
}

function stringify(obj, contentType) {
  contentType = contentType || DEFAULT_EXT;
  contentType = contentType.toLowerCase();

  switch(contentType) {
    case 'json':
      return JSON.stringify(obj, null, 2);
    break;
    default:
      throw new Error('cannot stringify unsupported contentType "' + contentType + '"');
    break;
  }
}

var PACKAGE = {
  "version": "0.0.0",
  "main": "app.js",
  "scripts": {
    "start": "node app.js"
  },
  "dependencies": {
    "loopback": "1.2.x"
  },
  "optionalDependencies": {
    "strong-cluster-control": "~0.1.0",
    "strong-agent": "~0.2.15",
    "loopback-explorer": "~1.0.0"
  }
};

function writePackage(dir, config, cb) {
  var pkg = JSON.parse(JSON.stringify(PACKAGE));
  pkg.name = config.name;
  fs.writeFile(path.join(dir, 'package.json'), stringify(pkg, 'json'), 'utf8', cb);
}
