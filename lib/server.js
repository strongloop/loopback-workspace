/*!
 * The Server exposes ProjectManager capabilities over a simple REST interface.
 */
var ProjectManager = require('./manager');
var http = require('http');

try {
  var express = require('express');
} catch (e) {
  console.error('Missing optional Express dependency. To fix, please re-install.');
  console.error('Otherwise, Asteroid Project Manager Server cannot be used.');
  process.exit(1);
}

/**
 * Creates a new instance of Server. See ProjectManager for additional options.
 *
 * @param {Number} options.port The port to listen on. Overridden by process.env.PORT. Defaults to 3000.
 */
function Server(options) {
  if (!(this instanceof Server)) {
    return new Server(options);
  }

  options = options || {};

  this.port = process.env.PORT || options.port || 3000;

  this.router = express();
  this.server = http.createServer(this.router);
  this.manager = new ProjectManager(options);

  this.router.use(express.json());
  this.router.use(express.logger());
  this.router.get('/projects', this.getProjects.bind(this));
  this.router.get('/projects/:name', this.getProject.bind(this));
  this.router.put('/projects/:name', this.createProject.bind(this));
  this.router.del('/projects/:name', this.removeProject.bind(this));
  this.router.put('/projects/:name/modules/:subname', this.addModuleToProject.bind(this));
  this.router.del('/projects/:name/modules/:subname', this.removeModuleFromProject.bind(this));
  this.router.use(this.handleError.bind(this));
}
Server.createServer = Server;

/**
 * TODO: Description.
 */
Server.prototype.start = start;
function start(callback) {
  var self = this;

  self.server.listen(self.port, callback);

  return self;
}

/**
 * TODO: Description.
 */
Server.prototype.stop = stop;
function stop(callback) {
  var self = this;

  self.server.close(callback);

  return self;
}

/**
 * TODO: Description.
 */
Server.prototype.getProjects = getProjects;
function getProjects(req, res, next) {
  var self = this;

  self.manager.projects(function (err, names) {
    if (err) {
      return next(err);
    }

    res.send({
      names: names
    });
  });

  return self;
}

/**
 * TODO: Description.
 */
Server.prototype.getProject = getProject;
function getProject(req, res, next) {
  var self = this;
  var dir = req.params.name;

  self.manager.get(dir, function (err, project) {
    if (err) {
      return next(err);
    }

    res.send(project);
  });

  return self;
}

/**
 * TODO: Description.
 */
Server.prototype.createProject = createProject;
function createProject(req, res, next) {
  var self = this;
  var options = req.body;
  var dir = req.params.name;

  self.manager.create(dir, options, function (err, project) {
    if (err) {
      return next(err);
    }

    project.load(function (err) {
      if (err) {
        return next(err);
      }

      res.send(project);
    });
  });

  return self;
}

/**
 * TODO: Description.
 */
Server.prototype.removeProject = removeProject;
function removeProject(req, res, next) {
  var self = this;
  var dir = req.params.name;

  self.manager.get(dir, function (err, project) {
    if (err) {
      return next(err);
    }

    project.remove(function (err) {
      if (err) {
        return next(err);
      }

      res.send(project);
    });
  });

  return self;
}

/**
 * TODO: Description.
 */
Server.prototype.addModuleToProject = addModuleToProject;
function addModuleToProject(req, res, next) {
  var self = this;
  var factory = self.manager.factory(req.body.type);
  var dir = req.params.name;
  var subdir = req.params.subname;

  if (!factory) {
    return next(new Error('Factory ' + req.body.type + ' does not exist.'));
  }

  self.manager.get(dir, function (err, project) {
    if (err) {
      return next(err);
    }

    project.addModule(factory, subdir, req.body, function (err) {
      if (err) {
        return next(err);
      }

      res.send({});
    });
  });

  return self;
}

/**
 * TODO: Description.
 */
Server.prototype.removeModuleFromProject = removeModuleFromProject;
function removeModuleFromProject(req, res, next) {
  var self = this;
  var dir = req.params.name;
  var subdir = req.params.subname;

  self.manager.get(dir, function (err, project) {
    if (err) {
      return next(err);
    }

    project.removeModule(subdir, function (err) {
      if (err) {
        return next(err);
      }

      res.send({});
    });
  });

  return self;
}

/**
 * TODO: Description.
 */
Server.prototype.handleError = handleError;
function handleError(err, req, res, next) {
  var self = this;

  // TODO: Real error handling.
  res.send(400, {
    error: err.message || err
  });

  return self;
}

/*!
 * Export `Server`.
 */
module.exports = Server;
