'use strict';

module.exports = function(app) {
  const db = app.dataSources.db;
  app.dataSources.db.connector = getMockDataSourceDef(db.connector);
};

function getMockDataSourceDef(dataSource) {
  const mockDataSource = {
    schema: 'mock1',
    migratedModels: {},
    connect: function(cb) {
      cb();
    },
    automigrate: function(modelName, cb) {
      this.migratedModels[this.schema + '.' + modelName] = modelName;
      cb();
    },
    discoverSchemas: function(modelName, options, cb) {
      cb(null, this.migratedModels);
    },
  };
  dataSource.originalAutoMigrate = dataSource.automigrate;
  return Object.assign(dataSource, mockDataSource);
}
