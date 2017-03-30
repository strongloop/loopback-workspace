'use strict';
const Relation = require('../datamodel/relation');
const fs = require('fs-extra');
const config = require('../config');
const path = require('path');

/**
 * @class ModelConfig
 *
 * Represents a ModelConfig artifact in the Workspace graph.
 */
class ModelConfig extends Relation {
  constructor(workspace, id, data) {
    super(workspace, 'ModelRelation', id, data);
  }
  getDefinition() {
    return this.data;
  }
  write(facet, modelConfig, cb) {
    let data = {};
    data._meta = config.modelsMetadata;
    if (modelConfig)
      data[modelConfig._name] =
        modelConfig.getContents({filter: ['id', 'modelId']});
    const modelConfigData =
      facet.modelconfig().map({json: true, filter: 'modelId'});
    data = Object.assign({}, data, modelConfigData);
    const filePath = facet.getModelConfigPath();
    fs.writeJson(filePath, data, cb);
  }
  read(facet, cb) {
    const filePath = facet.getModelConfigPath();
    fs.readJson(filePath, function(err, config) {
      if (err) return err;
      Object.keys(config).forEach(function(key) {
        if (key === '_meta') return;
        let modelConfig = facet.modelconfig(key);
        if (modelConfig) {
          modelConfig._content = config[key];
        } else {
          facet.setModelConfig(key, config[key]);
        }
      });
      cb(null, config);
    });
  }

};

module.exports = ModelConfig;
