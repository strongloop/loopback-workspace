var models = require('../../app').models;

var given = module.exports;

/**
 * Configure the server facet to listen on a port that has a different
 * value in each process.
 * @param {function(Error=)} done callback
 */
given.uniqueServerPort = function(done) {
  var FacetSetting = models.FacetSetting;

  // Use PID to generate a port number in the range 10k-50k
  // that is unique for each test process
  var port = 10000 + (process.pid % 40000);

  var props =  { facetName: 'server', name: 'port' };
  FacetSetting.findOne({ where: props }, function(err, entry) {
    if (err) return done(err);
    if (!entry)
      entry = new FacetSetting(props);

    entry.value = port;
    entry.save(done);
  });
};
