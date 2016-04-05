// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function(app, cb) {
  app.asyncBoot = typeof cb === 'function';
  process.nextTick(cb);
};
