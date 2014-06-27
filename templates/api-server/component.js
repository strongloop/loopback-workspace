/**
 * The api-server component template.
 */

var template = module.exports;
var component = template.component = {
  restApiRoot: '/api'
};

template.config = {
  components: ['rest', 'server']
};

template.package = {
  "version": "0.0.0",
  "main": "server/server.js",
  "dependencies": {
    "loopback": "~2.0.0-beta3",
    "loopback-datasource-juggler": "~2.0.0-beta2"
  },
  "optionalDependencies": {
    "loopback-explorer": "^1.1.0"
  }
};