// Copyright IBM Corp. 2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';
module.exports = function(ComponentConfig) {
  ComponentConfig.validatesPresenceOf('facetName');

  ComponentConfig.validatesPresenceOf('name');
  ComponentConfig.validatesUniquenessOf('name', { scopedTo: ['app'] });

  ComponentConfig.deserialize = function(cache, facetName, configFile) {
    var data = configFile.data;
    Object.keys(data).forEach(function(name) {
      var value = {
        configFile: configFile.path,
        facetName: facetName,
        name: name,
        value: data[name],
      };
      ComponentConfig.addToCache(cache, value);
    });
  };

  ComponentConfig.serialize = function(cache, facetName) {
    var data = {};

    ComponentConfig.allFromCache(cache).forEach(function(item) {
      if (item.facetName !== facetName) return;
      data[item.name] = item.value;
    });

    if (!Object.keys(data).length) return null; // nothing to save
    var configFile = ComponentConfig.getConfigFile(facetName);
    configFile.data = data;
    return configFile;
  };
};
