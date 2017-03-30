'use strict';
const Entity = require('./entity');
const fs = require('fs-extra');
const path = require('path');

/**
 * @class DataSource
 *
 * Represents a DataSource artifact in the Workspace graph.
 */
class DataSource extends Entity {
  constructor(Workspace, id, datasource, options) {
    super(Workspace, 'DataSource', id, datasource);
    this.options = options;
  }
  getDefinition() {
    return this._content;
  }
  read(facet, cb) {
    const filePath = facet.getDataSourceConfigFilePath();
    fs.readJson(filePath, function(err, data) {
      if (err) return err;
      cb(null, data);
    });
  }
  write(facet, datasource, cb) {
    const configData = facet.datasources().map({json: true});
    configData[datasource._name] = datasource.getContents();
    const filePath = facet.getDataSourceConfigFilePath();
    fs.mkdirp(path.dirname(filePath), function(err) {
      if (err) return cb(err);
      fs.writeJson(filePath, configData, function(err) {
        if (err) return cb(err);
        cb(null, configData);
      });
    });
  }
};

module.exports = DataSource;
