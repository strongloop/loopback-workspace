// Copyright IBM Corp. 2015,2019. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

'use strict';

module.exports = function mountRestApi(server) {
  const restApiRoot = server.get('restApiRoot');
  server.use(restApiRoot, server.loopback.rest());
};
