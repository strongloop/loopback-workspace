'use strict';

const DataSource = require('../datamodel/datasource');
const fsUtility = require('../util/file-utility');
const mixin = require('../util/mixin');

class DataSourceActions {
  create(facetName, cb) {
    const workspace = this.getWorkspace();
    const datasource = this;
    const facet = workspace.facets(facetName);
    fsUtility.writeDataSourceConfig(facet, datasource, function(err) {
      if (err) return cb(err);
      facet.add(datasource);
      cb();
    });
  }
  refresh(facetName, cb) {
    const workspace = this.getWorkspace();
    const facet = workspace.facets(facetName);
    fsUtility.readDataSource(facet, function(err, config) {
      if (err) return cb(err);
      const datasources = facet.datasources();
      Object.keys(config).forEach(function(key) {
        let ds = datasources.get(key);
        if (ds) {
          ds.set(config[key]);
        } else {
          const datasource = new DataSource(workspace, key, config[key]);
          facet.add(datasource);
        }
      });
      cb();
    });
  }
  update(facetName, attrs, cb) {
    const workspace = this.getWorkspace();
    const datasource = this;
    datasource.set(attrs);
    const facet = workspace.facets(facetName);
    fsUtility.writeDataSourceConfig(facet, datasource, cb);
  }
}

mixin(DataSource.prototype, DataSourceActions.prototype);
