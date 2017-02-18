'use strict';

module.exports = function(app) {
  const db = app.dataSources.db;
  app.dataSources.db.connector = getMockDataSourceDef(db.connector);
};

function getMockDataSourceDef(dataSource) {
  const mockDataSource = {
    migratedModels: {},
    automigrate: function(modelName, cb) {
      this.migratedModels[modelName] = this._models[modelName];
      this.originalAutoMigrate(modelName, cb);
    },
    discoverSchemas: function(modelName, options, cb) {
      const data = this.migratedModels[modelName];
      cb(null, data.properties);
    },
  };
  dataSource.originalAutoMigrate = dataSource.automigrate;
  return Object.assign(dataSource, mockDataSource);
}
