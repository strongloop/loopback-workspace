if (require.main === module) {
  require('./bin/project-manager');
} else {
  module.exports = require('./lib');
}
