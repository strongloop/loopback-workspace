'use strict';
var _ = require('lodash');
// Check attached CloudFoundry services
var services = process.env.VCAP_SERVICES;
if (typeof services === 'string') {
  services = JSON.parse(services);
} else {
  services = {};
}
var dataSources = {};
for (var s in services) {
  var serviceList = services[s];
  // Each key has an array of configuration objects
  for (var i = 0, n = serviceList.length; i < n; i++) {
    var service = serviceList[i];
    // We need a better way to filter services of interest
    if (s === 'compose-for-mongodb') {
      dataSources[s] = _.cloneDeep(service.credentials);
      // We need a better way to map service configuration to data source
      dataSources[s].url = dataSources[s].uri;
      dataSources[s].connector = 'mongodb';
    }
    if (s === 'compose-for-mysql') {
      dataSources[s] = _.cloneDeep(service.credentials);
      // We need a better way to map service configuration to data source
      dataSources[s].url = dataSources[s].uri;
      dataSources[s].connector = 'mysql';
    }
    if (s === 'compose-for-postgresql') {
      dataSources[s] = _.cloneDeep(service.credentials);
      // We need a better way to map service configuration to data source
      dataSources[s].url = dataSources[s].uri;
      dataSources[s].connector = 'postgresql';
    }
    if (s === 'cloudantNoSQLDB') {
      dataSources[s] = _.cloneDeep(service.credentials);
      dataSources[s].database = 'loopback';
      dataSources[s].connector = 'cloudant';
    }
  }
}

module.exports = dataSources;
