var app = require('../');
var ConfigFile = app.models.ConfigFile;
var ModelDefinition = app.models.ModelDefinition;
var ModelMethod = app.models.ModelMethod;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('ModelMethod', function() {
  var userModel;

  beforeEach(givenBasicWorkspace);
  beforeEach(function(done) {
    ModelDefinition.create(
      {
        name: 'user',
        facetName: 'server'
      },
      function(err, result) {
        if (err) return done(err);
        userModel = result;
        done();
      });
  });

  it('is represented as a key-value map in model definition', function(done) {
    var cfg = new ConfigFile({ path: 'server/models/user.json' });
    cfg.load(function(err) {
      if (err) return done(err);
      expect(cfg.data.methods).to.be.an('object');
      done();
    });
  });

  it('correctly adds new method', function(done) {
    ModelMethod.create(
      {
        modelId: userModel.id,
        name: 'testMethod',
        isStatic: true
      },
      function(err) {
        if (err) return done(err);
        userModel.methods(function(err, list) {
          if (err) return done(err);
          expect(list).to.have.length(1);
          expect(list[0]).to.have.property('name', 'testMethod');
          expect(list[0]).to.have.property('isStatic', true);

          var cfg = new ConfigFile({ path: 'server/models/user.json' });
          cfg.load(function(err) {
            if (err) return done(err);
            var methods = cfg.data.methods;
            expect(methods).to.be.an('object');
            expect(methods).to.have.property('testMethod');
            expect(methods.testMethod).to.have.property('isStatic', true);
            done();
          });
        });
      });
  });

  it('supports multiple http endpoints', function(done) {
    ModelMethod.create(
      {
        modelId: userModel.id,
        name: 'multiMethod',
        isStatic: true,
        http: [
          { verb: 'get', path: '/get' },
          { verb: 'head', path: '/head' }
        ]
      },
      function(err) {
        if (err) return done(err);

        userModel.methods(function(err, list) {
          if (err) return done(err);
          expect(list).to.have.length(1);
          var method = list[0];
          expect(method).to.have.property('name', 'multiMethod');
          expect(method).to.have.property('http').to.have.length(2);
          expect(method.http[0]).to.eql({ verb: 'get', path: '/get' });
          expect(method.http[1]).to.eql({ verb: 'head', path: '/head' });

          var cfg = new ConfigFile({ path: 'server/models/user.json' });
          cfg.load(function(err) {
            if (err) return done(err);
            var methods = cfg.data.methods;
            expect(methods).to.have.property('multiMethod');
            expect(methods.multiMethod).to.have.property('http').eql([
              { verb: 'get', path: '/get' },
              { verb: 'head', path: '/head' }
            ]);
            done();
          });
        });
      });
  });
});
