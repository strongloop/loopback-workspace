/**
 * The api-server component template.
 */

var template = module.exports;
var component = template.component = {
};

template.config = {
  components: ['server']
};

template.package = {
  "version": "0.0.0",
  "main": "server/server.js",
  "dependencies": {
    "compression": "^1.0.3",
    "errorhandler": "^1.1.1",
    "loopback": "~2.0.0-beta5",
    "loopback-boot": "2.0.0-beta1",
    "loopback-datasource-juggler": "~2.0.0-beta2"
  },
  "optionalDependencies": {
    "loopback-explorer": "^1.1.0"
  }
};
