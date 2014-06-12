module.exports = function() {
  return {
    "version": "0.0.1",
    "main": "app.js",
    "scripts": {
      "start": "node app.js"
    },
    "dependencies": {
      // TODO(ritch) this should be updated after we release 2.0
      "loopback": "*",
    },
    "optionalDependencies": {
      "loopback-explorer": "~1.1.0",
      "loopback-push-notification": "~1.2.0"
    },
    "loopback": {
      "apps": []
    }
  };
}
