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
var PACKAGE = require('../templates/package');

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
        var model = models[modelName];
        model.name = modelName;
        project.models.create(model, cb);
      }, cb);
    },
    function(cb) {
      async.each(Object.keys(dataSources), function (dsName, cb) {
        var ds = dataSources[dsName];
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

  config.name = path.basename(dir);

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

Project.prototype.getDataSourceByName = function(name, cb) {
  assert(typeof name === 'string');
  assert(typeof cb === 'function');

  this.dataSources({where: {name: name}, limit: 1}, function(err, results) {
    if(err) return cb(err);
    cb(null, results[0]);
  });
}

Project.prototype.getModelByName = function(name, cb) {
  assert(typeof name === 'string');
  assert(typeof cb === 'function');

  this.models({where: {name: name}, limit: 1}, function(err, results) {
    if(err) return cb(err);
    cb(null, results[0]);
  });
}

var ACCESS_TYPES = ['all', 'read', 'write', 'execute'];
var PERMISSIONS = ['allow', 'alarm', 'audit', 'deny'];
var ROLE_IDS = ['owner', 'related', 'authenticated',
                'unauthenticated', 'everyone'];

/**
 * Add an ACL to the given model(s), converting the options object into an
 * ACL definition. All options are booleans unless otherwise noted.
 *
 * **options**
 *
 *  - `model` - the name of the model to add the permission to. May be ommitted
 *  if the `all-models` option is provided
 *  - `all-models` - apply the permission to all models. Canonot be used with `model`.
 * 
 * **options: access type**
 *
 *  - `all` - wildcard, matches all types of access
 *  - `read` - read
 *  - `write`- write
 *  - `execute` - execute a method
 *
 * **options: properties and methods**
 *
 * - `property` - optional -  specify a specific property
 * - `method` -  optional - specifcy a specific method name (matches both instance and
 * static)
 * 
 * **options: role identifiers**
 *
 *  - `owner` - Owner of the object
 *  - `related` Any user with a relationship to the object
 *  - `authenticated` - Authenticated user
 *  - `unauthenticated` - Unauthenticated user
 *  - `everyone` Every user
 *
 * **options: permissions**
 *
 * - `alarm` - Generate an alarm, in a system dependent way, the access
 * specified in the permissions component of the ACL entry.
 * - `allow` - Explicitly grants access to the resource.
 * - `audit` - Log, in a system dependent way, the access specified in the
 * permissions component of the ACL entry.
 * - `deny` - Explicitly denies access to the resource. 
 *
 * **notes:**
 *
 *  - you may only supply a single access type
 *  - you may only supply a single role identifier
 *  - you may only supply a single permission
 * 
 * @param {Object} options
 * @param {Function} cb Will only include an error as the first argument if
 * one occured. No additional arguments.
 */

Project.prototype.addPermission = function(options, cb) {
  try {
    var accessTypes = getOptionsFromKeys(options, ACCESS_TYPES);
    var permissions = getOptionsFromKeys(options, PERMISSIONS);
    var roleIdentifiers = getOptionsFromKeys(options, ROLE_IDS);

    // model
    assert(!(options.model && options['all-models']), 
      'Cannot add a permission when `all` and `model` options are supplied!');
    assert(options.model || options['all-models'], 
      'You must supply `all-models` or `model`');
    assert(options['all-models'] || (typeof options.model === 'string'),
      '`model` must be a string');
    assert(accessTypes.length <= 1, 'Cannot add permission with multiple '
      + 'access types (eg. `all`, `read`, `write`, `exec`)!');
    assert(permissions.length === 1, 'You must supply a single permission!');
    assert(
      roleIdentifiers.length === 1,
      'You must supply a single role identifier!'
    );
  } catch(e) {
    return cb(e);
  }

  var accessType = accessTypes[0] || {key: 'all'};
  var permission = permissions[0];
  var roleId = roleIdentifiers[0];
  var acl = {};

  switch(accessType.key) {
    case 'all':
      acl.accessType = '*';
    break;
    default:
      acl.accessType = accessType.key.toUpperCase();
    break;
  }

  acl.permission = permission.key.toUpperCase();
  acl.principalType = 'ROLE';
  acl.principalId = '$' + roleId.key;

  if(options.property || options.method) {
    acl.property = options.property || options.method;  
  }
  

  if(options.model) {
    async.waterfall([
      this.getModelByName.bind(this, options.model),
      function(model, callback) {
        applyPermissions([model], acl, callback);
      }
    ], cb);
  } else {
    async.waterfall([
      this.models.bind(this),
      function(models, callback) {
        applyPermissions(models, acl, callback);
      }
    ], cb);
  }
}

function getOptionsFromKeys(options, keys) {
  var result = [];

  keys.forEach(function(key) {
    if(options[key]) result.push({key: key, val: options[key]});
  });

  return result;
}

function applyPermissions(models, acl, cb) {
  async.each(models, function(model, callback) {
    model.options = model.options || {};
    model.options.acls = model.options.acls || [];
    model.options.acls.push(acl);
    model.save(callback);
  }, cb);
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

/**
 * Set the default ACL permission for the project.
 *
 * @param {String} permission allow|deny
 */

Project.prototype.setPermissionDefault = function(permission) {
  this.app.defaultPermission = permission;
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

function writePackage(dir, config, cb) {
  var pkg = JSON.parse(JSON.stringify(PACKAGE));
  pkg.name = config.name;
  fs.writeFile(path.join(dir, 'package.json'), stringify(pkg, 'json'), 'utf8', cb);
}
