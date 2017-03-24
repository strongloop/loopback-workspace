'use strict';

const DataSource = require('../datamodel/datasource');
const fsUtility = require('../util/file-utility');
const mixin = require('../util/mixin');

class DataSourceActions {
  create(cb) {
    const workspace = this.getWorkspace();
    fsUtility.writeDataSourceConfig(workspace, cb);
  }
  refresh(cb) {
    const workspace = this.getWorkspace();
    fsUtility.readDataSource(workspace, cb);
  }
  update(attrs, cb) {
    const workspace = this.getWorkspace();
    this.set(attrs);
    fsUtility.writeDataSourceConfig(workspace, cb);
  }
}

mixin(DataSource.prototype, DataSourceActions.prototype);
