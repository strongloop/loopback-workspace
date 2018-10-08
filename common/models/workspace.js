// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var g = require('strong-globalize')();
var _ = require('lodash');
var helper = require('../../lib/helper');

module.exports = function(Workspace) {
  var app = require('../../server/server');
  app.once('ready', function() {
    ready(Workspace);
  });

  function ready(Workspace) {
    var loopback = require('loopback');
    var extend = require('util')._extend;
    var fs = require('fs');
    var ncp = require('ncp');
    var path = require('path');
    var async = require('async');
    var spawn = require('child_process').spawn;
    var waitTillListening = require('strong-wait-till-listening');

    var PackageDefinition = app.models.PackageDefinition;
    var ConfigFile = app.models.ConfigFile;
    var ComponentConfig = app.models.ComponentConfig;
    var Facet = app.models.Facet;
    var FacetSetting = app.models.FacetSetting;
    var ModelConfig = app.models.ModelConfig;
    var DataSourceDefinition = app.models.DataSourceDefinition;
    var ModelDefinition = app.models.ModelDefinition;
    var ModelRelation = app.models.ModelRelation;
    var ViewDefinition = app.models.ViewDefinition;
    var TEMPLATE_DIR = path.join(__dirname, '..', '..', 'templates', 'projects');
    var DEFAULT_TEMPLATE = 'api-server';
    var DEPENDENCIES_3_X = {
      'loopback': '^3.22.0',
      'loopback-component-explorer': '^6.2.0',
    };
    var DEPENDENCIES_2_X = {
      'loopback': '^2.40.0',
      'loopback-component-explorer': '^5.4.0',
      'loopback-datasource-juggler': '^2.58.0',
    };
    var debug = require('debug')('workspace');

    /**
     * Groups related LoopBack applications.
     * @class Workspace
     * @inherits Model
     */

    /**
     * Get list of available loopback Versions.
     *
     * @callback {Function} callback
     * @param {Error} err
     * @param {Object} availableLBVersions
     */

    Workspace.getAvailableLBVersions = function(cb) {
      var availableLBVersions = {
        '3.x': { description: g.f('Active Long Term Support') },
        '2.x': { description: g.f('Maintenance Long Term Support') },
      };
      cb(null, availableLBVersions);
    };

    Workspace.availableLBVersions = function(cb) {
      Workspace.getAvailableLBVersions(function(err, data) {
        var lbVersions = [];
        Object.keys(data).forEach(function(key) {
          var version = data[key];
          lbVersions.push({ value: key, description: version.description });
        });
        cb(null, lbVersions);
      });
    };

    loopback.remoteMethod(Workspace.availableLBVersions, {
      http: { verb: 'get', path: '/loopback-versions' },
      returns: { arg: 'versions', type: 'array' },
    });

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
    };

    function dirFilter(file) {
      return file.indexOf('.') === -1;
    }

    loopback.remoteMethod(Workspace.getAvailableTemplates, {
      http: { verb: 'get', path: '/component-templates' },
      returns: { arg: 'templates', type: 'array' },
    });

    /**
     * Get a list of available templates, including
     * additional information like `displayName` and `description`.
     *
     * @callback {Function} callback
     * @param {Error} err
     * @param {Object[]} templates
     */

    Workspace.describeAvailableTemplates = function(cb) {
      Workspace.getAvailableTemplates(function(err, names) {
        if (err) return cb(err);
        var templates = names.map(function(name) {
          var data = Workspace._loadProjectTemplate(name);
          if (!data) return data;
          return {
            name: name,
            description: data.description,
            supportedLBVersions: data.supportedLBVersions,
          };
        });
        cb(null, templates);
      });
    };

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

    Workspace._loadProjectTemplate = function(templateName) {
      var template;
      try {
        template = require(
          '../../templates/projects/' + templateName + '/data');
      } catch (e) {
        g.error('Cannot load project template %j: %s',
                      templateName, e.stack);
        return null;
      }
      // TODO(bajtos) build a full list of files here, so that
      // when two templates provide a different version of the same file,
      // we resolve the conflict here, before any files are copied
      template.files = [path.join(TEMPLATE_DIR, templateName, 'files')];

      var sources = [template];
      /* eslint-disable one-var */
      if (template.inherits) for (var ix in template.inherits) {
        var t = template.inherits[ix];
        var data = this._loadProjectTemplate(t);
        if (!data) return null; // the error was already reported
        delete data.supportedLBVersions;
        sources.unshift(data);
      }
      /* eslint-enable one-var */

      // TODO(bajtos) use topological sort to resolve duplicated dependencies
      // e.g. A inherits B,C; B inherits D; C inherits D too

      // merge into a new object to preserve the originals
      sources.unshift({});

      // when merging arrays, concatenate them (lodash replaces by default)
      sources.push(function templateMergeCustomizer(a, b) {
        if (_.isArray(a)) {
          return a.concat(b);
        }
      });

      return _.mergeWith.apply(_, sources);
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
        throw new Error(g.f('Non-root components are not supported yet.'));
      }
      var loopbackVersion = options.loopbackVersion || helper.DEFAULT_LB_VERSION;
      var templateName = options.template || DEFAULT_TEMPLATE;
      var name = options.name || templateName;
      var packageName = options.packageName || name;
      var description = options.description || packageName;
      if (options.root) name = ConfigFile.ROOT_COMPONENT;

      debug('create from template [%s]', templateName);

      var template = this._loadProjectTemplate(templateName);

      if (!template) {
        var err = new Error(g.f('Unknown template %s' + templateName));
        err.templateName = templateName;
        err.statusCode = 400;
        return cb(err);
      }

      if (loopbackVersion !== '2.x' && loopbackVersion !== '3.x') {
        return cb(new Error(g.f('Loopback version should be either 2.x or 3.x')));
      }
      var defaultDependencies = template.package.dependencies;
      var loopbackDependencies =
        loopbackVersion === '2.x' ? DEPENDENCIES_2_X : DEPENDENCIES_3_X;
      template.package.dependencies = extend(defaultDependencies, loopbackDependencies);

      // TODO(bajtos) come up with a more generic approach
      var explorer = 'loopback-component-explorer';
      if (options[explorer] === false) {
        if (template.package)
          delete template.package.dependencies[explorer];
        if (template.server && template.server.componentConfigs)
          template.server.componentConfigs = template.server.componentConfigs
            .filter(function(cc) { return cc.name != explorer; });
      }

      // Add LoopBack 2.x specific flags to preven warnings on startup
      if (loopbackVersion === '2.x' &&
        template.server && template.server.config) {
        // Disable legacy routes describing remote methods
        template.server.config.push({ name: 'legacyExplorer', value: false });
        // Enable AccessToken invalidation on email/password change
        template.server.config.push({
          name: 'logoutSessionsOnSensitiveChanges',
          value: true,
        });
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

      template.files.forEach(function(dir) {
        steps.push(function(cb) {
          fs.exists(dir, function(exists) {
            if (exists) {
              Workspace.copyRecursive(dir, dest, cb);
            } else {
              cb();
            }
          });
        });
      });

      // This step is required as NPM renames `.gitignore` to `.npmignore`
      steps.push(function(cb) {
        Workspace.copyGitignore(dest, cb);
      });

      async.series(steps, cb);
    };

    /**
     * Copy `gitignore` to the destination directory as `.gitignore`.
     *
     * @param {String} dest
     * @callback {Function} cb
     */
    Workspace.copyGitignore = function(dest, cb) {
      if (arguments.length === 3) {
        // support the old signature copyGitignore(templateDir, dest, cb)
        dest = arguments[2];
        cb = arguments[3];
      }

      var gitignore = require.resolve('../../templates/gitignore');
      var dotGitignore = path.resolve(dest, '.gitignore');
      Workspace.copyRecursive(gitignore, dotGitignore, cb);
    };

    loopback.remoteMethod(Workspace.addComponent, {
      http: { verb: 'post', path: '/component' },
      accepts: { arg: 'options', type: 'object', http: { source: 'body' }},
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

      if (template.modelConfigs) {
        setFacetName(template.modelConfigs);
        steps.push(function(cb) {
          async.each(template.modelConfigs,
            ModelConfig.create.bind(ModelConfig), cb);
        });
      }

      if (template.models) {
        setFacetName(template.models);
        steps.push(function(cb) {
          async.each(template.models,
            ModelDefinition.create.bind(ModelDefinition), cb);
        });
      }

      if (template.datasources) {
        setFacetName(template.datasources);
        steps.push(function(cb) {
          async.each(template.datasources,
            DataSourceDefinition.create.bind(DataSourceDefinition), cb);
        });
      }

      if (template.relations) {
        setFacetName(template.relations);
        steps.push(function(cb) {
          async.each(template.relations,
            ModelRelation.create.bind(ModelRelation), cb);
        });
      }

      if (template.componentConfigs) {
        setFacetName(template.componentConfigs);
        steps.push(function(cb) {
          async.each(template.componentConfigs,
                     ComponentConfig.create.bind(ComponentConfig), cb);
        });
      }

      function setFacetName(obj) {
        if (Array.isArray(obj)) {
          obj.forEach(function(item) {
            item.facetName = name;
          });
        } else if (obj) {
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
     * @param {String} name
     * @param {Object} options
     * @callback {Function} callback
     * @param {Error} err
     */

    Workspace.createFromTemplate = function(templateName, name, options, cb) {
      if (cb === undefined && typeof options === 'function') {
        cb = options;
        options = undefined;
      }

      // clone options so that we don't modify input arguments
      options = extend({}, options);

      options = extend(options, {
        root: true,
        name: name,
        template: templateName,
      });

      Workspace.addComponent(options, cb);
    };

    loopback.remoteMethod(Workspace.createFromTemplate, {
      http: { verb: 'post', path: '/' },
      accepts: [
        { arg: 'templateName', type: 'string' },
        { arg: 'name', type: 'string' },
      ],
    });

    /**
     * @typedef {{name, description,supportedByStrongLoop}} ConnectorMeta
     */

    /**
     * @type {Array.<ConnectorMeta>}
     * @internal
     */
    var staticConnectorList = require('../../available-connectors');

    function isDependency(connector, pkg, cb) {
      var packageName;
      var deps = pkg && pkg.dependencies;

      if (connector.package && deps) {
        packageName = connector.package.name;

        if (packageName && (packageName in deps)) {
          // TODO(ritch) search node_modules or use `require.resolve`
          return cb(null, true);
        }
      } else if (!connector.package) {
        // the connector isn't a package (eg. the memory connector)
        return cb(null, true);
      }

      // default to not installed
      return cb(null, false);
    }

    /**
     * List of connectors available on npm.
     * @param {function(Error=,Array.<ConnectorMeta>=)} cb
     */
    Workspace.listAvailableConnectors = function(cb) {
      PackageDefinition.findOne(function(err, pkg) {
        if (err) return cb(err);
        async.map(staticConnectorList, function(connector, cb) {
          isDependency(connector, pkg, function(err, isDep) {
            if (err) return cb(err);

            connector.installed = isDep;
            cb(null, connector);
          });
        }, cb);
      });
    };

    loopback.remoteMethod(Workspace.listAvailableConnectors, {
      http: { verb: 'get', path: '/connectors' },
      returns: { arg: 'connectors', type: 'array', root: true },
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
          cb(new Error(g.f('Invalid workspace: no facets found.')));
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
              env: env,
            });
        } catch (err) {
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
          done(new Error(g.f('Child exited with code %s', code)));
        });

        // Wait until the child process starts listening
        var waitOpts = {
          host: host,
          port: port || 3000, // 3000 is the default port provided by loopback
          timeoutInMs: 30000,  // 30 seconds
        };

        // Windows will fail to connect if the host is 0.0.0.0, so redirect to
        // localhost to prevent the startup detection from timing out.
        if (waitOpts.host === '0.0.0.0') {
          waitOpts.host = 'localhost';
        }

        debug('Listening for child on %s:%s', waitOpts.host, waitOpts.port);
        waitTillListening(waitOpts, function onWaitIsOver(err) {
          if (err) {
            debug('Child not listening, killing it. %s', err);
            Workspace.stop(function() {
            });
            return done(err);
          }
          debug('Child started with pid', child.pid);
          done(null, { pid: child.pid, host: waitOpts.host, port: waitOpts.port });
        });
      });

      function done() {
        // prevent double-callback
        var callback = cb;
        cb = function() {
        };

        callback.apply(this, arguments);
      }
    };

    function fetchServerHostPort(cb) {
      FacetSetting.find(
        { where: { facetName: 'server' }},
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
      returns: {
        arg: 'data',
        type: { pid: Number, host: String, port: Number },
        root: true,
      },
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
      returns: { arg: 'data', type: 'Object', root: true },
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
      returns: { arg: 'data', type: 'Object', root: true },
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
      returns: { arg: 'data', type: 'Object', root: true },
    });

    Workspace.getWorkspace = function(cb) {
      cb(null, process.env.WORKSPACE_DIR);
    };

    loopback.remoteMethod(Workspace.getWorkspace, {
      http: { verb: 'get', path: '/get-workspace' },
      returns: { arg: 'path', type: 'string' },
    });

    Workspace.loadWorkspace = function(path, cb) {
      app.dataSources.db.connector.saveToFile(null, function() {
        process.env.WORKSPACE_DIR = path;
        debug(process.env.WORKSPACE_DIR);
        app.dataSources.db.connector.loadFromFile(cb);
      });
    };

    loopback.remoteMethod(Workspace.loadWorkspace, {
      http: { verb: 'post', path: '/load-workspace' },
      accepts: { arg: 'path', type: 'string' },
      returns: { arg: 'data', type: 'Object', root: true },
    });
  }
};
