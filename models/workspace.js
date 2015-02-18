var loopback = require('loopback');
var extend = require('util')._extend;
var fs = require('fs');
var ncp = require('ncp');
var path = require('path');
var app = require('../app');
var async = require('async');
var spawn = require('child_process').spawn;
var waitTillListening = require('strong-wait-till-listening');

var PackageDefinition = app.models.PackageDefinition;
var ConfigFile = app.models.ConfigFile;
var Facet = app.models.Facet;
var FacetSetting = app.models.FacetSetting;
var ModelConfig = app.models.ModelConfig;
var DataSourceDefinition = app.models.DataSourceDefinition;
var ModelDefinition = app.models.ModelDefinition;
var ModelRelation = app.models.ModelRelation;
var ViewDefinition = app.models.ViewDefinition;
var TEMPLATE_DIR = path.join(__dirname, '..', 'templates', 'components');
var DEFAULT_TEMPLATE = 'api-server';
var debug = require('debug')('workspace');

/**
 * Groups related LoopBack applications.
 * @class Workspace
 * @inherits Model
 */

var Workspace = app.models.Workspace;

/**
 * Get an array of available template names.
 *
 * @callback {Function} callback
 * @param {Error} err
 * @param {String[]} templateNames 
 */

Workspace.getAvailableTemplates = function(cb) {
  fs.readdir(TEMPLATE_DIR, function(err, files) {
    cb(err, err ? undefined : files.filter(dirFilter));
  });
}

function dirFilter(file) {
  return file.indexOf('.') === -1;
}

loopback.remoteMethod(Workspace.getAvailableTemplates, {
  http: {verb: 'get', path: '/component-templates'},
  returns: {arg: 'templates', type: 'array'}
});

/**
 * Recursively copy files.
 * API consumers may override this function, e.g. to detect existing files
 * and provide conflict resolution.
 * @param {String} source
 * @param {String} destination
 * @param {function(Error=)} cb
 */
Workspace.copyRecursive = function(source, destination, cb) {
  ncp(source, destination, cb);
};

/**
 * Add a new component from a template.
 *
 * @param {Object} options
 * @option {String} name
 * @param {function(Error=)} cb
 */
Workspace.addComponent = function(options, cb) {
  if (!options.root) {
    throw new Error('Non-root components are not supported yet.');
  }
  var template;
  var templateName = options.template || DEFAULT_TEMPLATE;
  var name = options.name || templateName;
  var packageName = options.packageName || name;
  var description = options.description || packageName;
  if (options.root) name = ConfigFile.ROOT_COMPONENT;
  var fileTemplatesDir = path.join(TEMPLATE_DIR, templateName, 'template');

  try {
    template = require('../templates/components/' + templateName + '/component');
    // create a clone to preserve the original
    template = JSON.parse(JSON.stringify(template));
  } catch (e) {
    console.error(e);
  }

  debug('create from template [%s]', templateName);

  if (!template) {
    var err = new Error('Unknown template ' + templateName);
    err.templateName = templateName;
    err.statusCode = 400;
    return cb(err);
  }

  var dest = path.join(ConfigFile.getWorkspaceDir(), name);
  var steps = [];

  if (template.package) {
     template.package.name = packageName;
     template.package.description = description;
     steps.push(function(cb) {
       PackageDefinition.create(template.package, cb);
     });
  }

  ['common', 'server', 'client'].forEach(function(facetName) {
    var facet = template[facetName];
    if (!facet) return;
    steps.push(function(next) {
      createFacet(facetName, facet, next);
    });
  });

  steps.push(function(cb) {
    fs.exists(fileTemplatesDir, function(exists) {
      if (exists) {
        Workspace.copyRecursive(fileTemplatesDir, dest, cb);
      } else {
        cb();
      }
    });
  });

  // This step is required as NPM renames `.gitignore` to `.npmignore`
  steps.push(function(cb) {
    Workspace.copyGitignore(fileTemplatesDir, dest, cb);
  });

  async.series(steps, cb);
};

/**
 * Copy `gitignore` to the templates directory as `.gitignore`.
 *
 * @param {String} templatesDir
 * @param {String} dest
 * @callback {Function} cb
 */
Workspace.copyGitignore = function(templatesDir, dest, cb) {
  var gitignore = path.resolve(templatesDir, '..', 'gitignore');
  var dotGitignore = path.resolve(dest, '.gitignore');
  Workspace.copyRecursive(gitignore, dotGitignore, cb);
};

loopback.remoteMethod(Workspace.addComponent, {
  http: {verb: 'post', path: '/component'},
  accepts: {arg: 'options', type: 'object', http: {source: 'body'}}
});

function createFacet(name, template, cb) {
  var steps = [];

  steps.push(function(cb) {
    var facet = template.facet || {};
    facet.name = name;
    Facet.create(facet, cb);
  });

  if (template.config) {
    setFacetName(template.config);
    steps.push(function(next) {
      async.each(
        template.config,
        FacetSetting.create.bind(FacetSetting),
        next);
    });
  }

  if(template.modelConfigs) {
    setFacetName(template.modelConfigs);
    steps.push(function(cb) {
      async.each(template.modelConfigs,
        ModelConfig.create.bind(ModelConfig), cb);
    });
  }

  if(template.models) {
    setFacetName(template.models);
    steps.push(function(cb) {
      async.each(template.models,
        ModelDefinition.create.bind(ModelDefinition), cb);
    });
  }

  if(template.datasources) {
    setFacetName(template.datasources);
    steps.push(function(cb) {
      async.each(template.datasources,
        DataSourceDefinition.create.bind(DataSourceDefinition), cb);
    });
  }

  if(template.relations) {
    setFacetName(template.relations);
    steps.push(function(cb) {
      async.each(template.relations,
        ModelRelation.create.bind(ModelRelation), cb);
    });
  }

  function setFacetName(obj) {
    if(Array.isArray(obj)) {
      obj.forEach(function(item) {
        item.facetName = name;
      });
    } else if(obj) {
      obj.facetName = name;
    }
  }

  async.parallel(steps, cb);
}

/**
 * In the attached `dataSource`, create a set of app definitions and
 * corresponding workspace entities using the given template.
 *
 * @param {String} templateName
 * @callback {Function} callback
 * @param {Error} err
 */

Workspace.createFromTemplate = function(templateName, name, cb) {
  Workspace.addComponent({
    root: true,
    name: name,
    template: templateName
  }, cb);
}

loopback.remoteMethod(Workspace.createFromTemplate, {
  http: {verb: 'post', path: '/'},
  accepts: [
    { arg: 'templateName', type: 'string' },
    { arg: 'name', type: 'string' }
  ]
});

/**
 * @typedef {{name, description,supportedByStrongLoop}} ConnectorMeta
 */

/**
 * @type {Array.<ConnectorMeta>}
 * @internal
 */
var staticConnectorList = require('../available-connectors');

/**
 * List of connectors available on npm.
 * @param {function(Error=,Array.<ConnectorMeta>=)} cb
 */
Workspace.listAvailableConnectors = function(cb) {
  cb(null, staticConnectorList);
};

loopback.remoteMethod(Workspace.listAvailableConnectors, {
  http: {verb: 'get', path: '/connectors'},
  returns: {arg: 'connectors', type: 'array', root: true}
});

/**
 * Check if the project is a valid directory.
 * The callback is called with no arguments when the project is valid.
 * @param {function(Error=)} cb
 */
Workspace.isValidDir = function(cb) {
  // Every call of `Model.find()` triggers reload from the filesystem
  // This allows us to catch basic errors in config files
  Facet.find(function(err, list) {
    if (err) {
      cb(err);
    } else if (!list.length) {
      cb(new Error('Invalid workspace: no facets found.'));
    } else {
      // TODO(bajtos) Add more sophisticated validation based on facet types
      cb();
    }
  });
};

/**
 * Start the project (app) in the workspace.
 * @param {function(Error=,Object=)} cb callback
 */
Workspace.start = function(cb) {
  if (Workspace._child) {
    debug('child already running as %s', Workspace._child.pid);
    process.nextTick(function() {
      cb(null, { pid: Workspace._child.pid });
    });
    return;
  }

  // In order to wait for the child to start the HTTP server,
  // we need to know the host and port
  fetchServerHostPort(function startWithHostPort(err, host, port) {
    if (err) {
      debug('Cannot fetch host:port. %s', err);
      return done(err);
    }

    try {
      debug('starting a child process in %s', process.env.WORKSPACE_DIR);

      // Forward env variables like PATH, but remove HOST and PORT
      // to prevent the target app from listening on the same host:port
      // as the workspace is listening
      var env = extend({}, process.env);
      delete env.PORT;
      delete env.HOST;

      Workspace._child = spawn(
        process.execPath,
        ['.'],
        {
          cwd: process.env.WORKSPACE_DIR,
          stdio: 'inherit',
          env: env
        });
    } catch(err) {
      debug('spawn failed %s', err);
      return done(err);
    }

    var child = Workspace._child;

    child.on('error', function(err) {
      debug('child %s errored %s', child.pid, err);
      done(err);
    });

    child.on('exit', function(code) {
      debug('child %s exited with code %s', child.pid, code);
      Workspace._child = null;
      done(new Error('Child exited with code ' + code));
    });

    // Wait until the child process starts listening

    var waitOpts = {
      host: host,
      port: port || 3000, // 3000 is the default port provided by loopback
      timeoutInMs: 30000  // 30 seconds
    };

    waitTillListening(waitOpts, function onWaitIsOver(err) {
      if (err) {
        debug('Child not listening, killing it. %s', err);
        Workspace.stop(function(){});
        return done(err);
      }
      debug('Child started with pid', child.pid);
      done(null, { pid: child.pid });
    });
  });

  function done() {
    // prevent double-callback
    var callback = cb;
    cb = function(){};

    callback.apply(this, arguments);
  }
};

function fetchServerHostPort(cb) {
  FacetSetting.find(
    { where: { facetName: 'server' } },
    function extractHostPortFromFacetSettings(err, list) {
      if (err) return cb(err);
      var config = {};
      list.forEach(function(it) {
        config[it.name] = it.value;
      });

      cb(null, config.host, config.port);
    });
}

loopback.remoteMethod(Workspace.start, {
  http: { verb: 'post', path: '/start' },
  returns: { arg: 'data', type: 'StartResult', root: true }
});

process.once('exit', function killWorkspaceChild() {
  if (Workspace._child)
    Workspace._child.kill();
});

/**
 * Stop the project (app) in the workspace started by {@link start}.
 * @param {function(Error=,Object=)} cb callback
 */
Workspace.stop = function(cb) {
  if (!Workspace._child) {
    debug('skipping Workspace.stop - child not running');
    process.nextTick(function() {
      cb(null, { exitCode: null });
    });
    return;
  }

  debug('stopping the child process %s', this._child.pid);
  Workspace._child.once('exit', function(code) {
    debug('child was stopped');
    cb(null, { exitCode: code });
  });
  Workspace._child.kill();
};

loopback.remoteMethod(Workspace.stop, {
  http: { verb: 'post', path: '/stop' },
  returns: { arg: 'data', type: 'Object', root: true }
});

/**
 * Restart the project (app) in the workspace.
 * @param {function(Error=,Object=)} cb callback
 */
Workspace.restart = function(cb) {
  Workspace.stop(function(err) {
    if (err) return cb(err);
    Workspace.start(cb);
  });
};

loopback.remoteMethod(Workspace.restart, {
  http: { verb: 'post', path: '/restart' },
  returns: { arg: 'data', type: 'Object', root: true }
});

/**
 * Return run status of the app.
 * @param {function(Error=,Object=)} cb callback
 */
Workspace.isRunning = function(cb) {
  var result = Workspace._child ?
    { running: true, pid: Workspace._child.pid } :
    { running: false };

  process.nextTick(function() {
    cb(null, result);
  });
};

loopback.remoteMethod(Workspace.isRunning, {
  http: { verb: 'get', path: '/is-running' },
  returns: { arg: 'data', type: 'Object', root: true }
});
