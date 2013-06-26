if (require.main === module) {
  require('./bin/server');
} else {
  module.exports = require('./lib');
}
