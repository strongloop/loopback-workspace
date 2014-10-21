var fs = require('fs-extra');
var path = require('path');
var models = require('../../app').models;

var given = module.exports;

/**
 * Configure the server facet to listen on a port that has a different
 * value in each process.
 * @param {function(Error=)} done callback
 */
given.uniqueServerPort = function(done) {

  // Use PID to generate a port number in the range 10k-50k
  // that is unique for each test process
  var port = 10000 + (process.pid % 40000);

  given.facetSetting('server', 'port', port, done);
};

given.facetSetting = function(facetName, settingName, settingValue, done) {
  var FacetSetting = models.FacetSetting;

  var props =  { facetName: facetName, name: settingName };
  FacetSetting.findOne({ where: props }, function(err, entry) {
    if (err) return done(err);
    if (!entry)
      entry = new FacetSetting(props);

    entry.value = settingValue;
    entry.save(done);
  });
};

given.loopBackInSandboxModules = function() {
  var src = path.resolve(__dirname, '../../node_modules/loopback');
  var dest = path.resolve(SANDBOX, 'node_modules', 'loopback');
  fs.copySync(src, dest);
};

given.modelDefinition = function(facetName, modelDefinition) {
  var dir = path.resolve(SANDBOX, facetName, 'models');
  fs.mkdirpSync(dir);
  var file = path.resolve(dir, modelDefinition.name + '.json');
  fs.writeJsonFileSync(file, modelDefinition);
};
