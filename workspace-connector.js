exports.initialize = function (dataSource) {
  var settings = dataSource.settings || {};
  var connector = new WorkspaceConnector(settings);

  dataSource.connector = connector;
  connector.dataSource = dataSource;

  function WorkspaceConnector(settings) {
    this.settings = settings;
  }

  /**
   * Create a new model instance
   */

  WorkspaceConnector.prototype.create = function (model, data, cb) {
    var WorkspaceEntity = this.dataSource.getModel(model);
    var facetName = data.facetName;
    if(!facetName) return cb(new Error('facetName is required'));
    var file = WorkspaceEntity.getConfigFile(facetName, data);

    var steps = [
      WorkspaceEntity.addToFile.bind(WorkspaceEntity, file, data),
      file.save.bind(file)
    ];

    async.series(steps, cb);
  };
   
  /**
   * Save a model instance
   */

  WorkspaceConnector.prototype.save = function (model, data, cb) {
    var WorkspaceEntity = this.dataSource.getModel(model);
    var facetName = data.facetName;
    if(!facetName) return cb(new Error('facetName is required'));
    var file = WorkspaceEntity.getConfigFile(facetName, data);

    WorkspaceEntity.addToFile(file, data);
    file.save(cb);
  };
   
  /**
   * Check if a model instance exists by id
   */

  WorkspaceConnector.prototype.exists = function (model, id, cb) {
    var WorkspaceEntity = this.dataSource.getModel(model);
    var facetName = data.facetName;
    if(!facetName) return cb(new Error('facetName is required'));
    var file = WorkspaceEntity.getConfigFile(facetName, data);

    WorkspaceEntity.findById(id, function(err, entity) {
      if(err) return cb(err);
      cb(null, !!entity);
    });
  };
   
  /**
   * Find a model instance by id
   */

  WorkspaceConnector.prototype.find = function find(model, id, cb) {
    var WorkspaceEntity = this.dataSource.getModel(model);

    WorkspaceEntity.find({where: {id: id}}, function(err, entities) {
      var entity = entities[0];
      if(entity) {
        cb(null, entity);
      } else {
        cb(null, null);
      }
    });
  };
   
  /**
   * Update a model instance or create a new model instance if it doesn't exist
   */

  WorkspaceConnector.prototype.updateOrCreate = function updateOrCreate(model, data, cb) {
    var WorkspaceEntity = this.dataSource.getModel(model);
    var entity = new WorkspaceEntity(data);
    entity.save(cb);
  };
   
  /**
   * Delete a model instance by id
   */

  WorkspaceConnector.prototype.destroy = function destroy(model, id, cb) {
    var WorkspaceEntity = this.dataSource.getModel(model);
    var facetName = data.facetName;
    if(!facetName) return cb(new Error('facetName is required'));
    var file = WorkspaceEntity.getConfigFile(facetName, data);

    file.exists(function(err, exists) {
      if(err) return cb(err);
      if(exists) {
        WorkspaceEntity.removeFromFile(file, id, cb);
      } else {
        err = new Error('File does not exist');
        err.statusCode = 404;
        cb(err);
      }
    });
  };
   
  /**
   * Query model instances by the filter
   */

  WorkspaceConnector.prototype.all = function all(model, filter, cb) {
    var results = [];
    var WorkspaceEntity = this.dataSource.getModel(model);
    WorkspaceEntity.getAllConfigFiles(filter, function(err, files) {
      if(err) return cb(err);
      var entities = WorkspaceEntity.getAllFromFiles(files);
      cb(null, entities.filter(createFilter(filter)));
    });
  };
   
  /**
   * Delete all model instances
   */

  WorkspaceConnector.prototype.destroyAll = function destroyAll(model, cb) {
    var WorkspaceEntity = this.dataSource.getModel(model);
    WorkspaceEntity.find(function(err, entities) {
      async.each(entities, function(entity, cb) {
        entity.destroy(cb);
      }, cb);
    });
  };
   
  /**
   * Count the model instances by the where criteria
   */

  WorkspaceConnector.prototype.count = function count(model, cb, where) {
    var WorkspaceEntity = this.dataSource.getModel(model);
    WorkspaceEntity.find({where: where}, function(err, entities) {
      if(err) return cb(err);
      cb(null, entities.length);
    });
  };
   
  /**
   * Update the attributes for a model instance by id
   */

  WorkspaceConnector.prototype.updateAttributes = function updateAttrs(model, id, data, cb) {
    var WorkspaceEntity = this.dataSource.getModel(model);
    var facetName = data.facetName;
    if(!facetName) return cb(new Error('facetName is required'));
    var file = WorkspaceEntity.getConfigFile(facetName, data);

    WorkspaceEntity.findById(id, function(err, entity) {
      if(err) return cb(err);
      if(entity) {
        for(var key in data) {
          entity[key] = data[key];
        }
        entity.save(cb);
      } else {
        err = new Error('Could not find ' + WorkspaceEntity.modelName + ' with id ' + id);
        err.statusCode = 404;
        cb(err);
      }
    });
  };
}
