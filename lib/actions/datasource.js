'use strict';

const DataSource = require('../datamodel/datasource');
const fsUtility = require('../util/file-utility');
const mixin = require('../util/mixin');

class DataSourceActions {
  create(cb) {
    const workspace = this.getWorkspace();
    const datasource = this;
    fsUtility.writeDataSourceConfig(workspace, function(err) {
      if (err) return cb(err);
      workspace.add(datasource);
      cb();
    });
  }
  refresh(cb) {
    const workspace = this.getWorkspace();
    fsUtility.readDataSource(workspace, cb);
  }
  update(attrs, cb) {
    const workspace = this.getWorkspace();
    const datasource = this;
    datasource.set(attrs);
    fsUtility.writeDataSourceConfig(workspace, cb);
  }
}

mixin(DataSource.prototype, DataSourceActions.prototype);
