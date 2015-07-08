var async = require('async');
var app = require('../app');
var ConfigFile = app.models.ConfigFile;
var GatewayMap = app.models.GatewayMap;
var Pipeline = app.models.Pipeline;
var Policy = app.models.Policy;

var Facet = app.models.Facet;

describe('Gateway Policies', function() {

  function createPoliciesAndPipelines(cb) {
    async.parallel([
      function(done) {
        Policy.create({
          name: 'auth-catalog',
          type: 'auth',
          scopes: ['catalog', 'shopping'],
          phase: 'auth'
        }, done);
      },
      function(done) {
        Policy.create({
          name: 'rate-limiter-per-minute',
          type: 'rate-limiting',
          interval: 60000,
          limit: 1000,
          phase: 'auth:after'
        }, done);
      },
      function(done) {
        Policy.create({
          name: 'proxy-to-catalog',
          type: 'reverse-proxy',
          target: 'https://server1.example.com/api/catalog',
          phase: 'final'
        }, done);
      }], function(err, policies) {
      if (err) return cb(err);
      Pipeline.create({
        name: 'default-pipeline'
      }, function(err, pipeline) {
        if (err) return cb(err);
        async.each(policies, function(policy, done) {
          pipeline.policies.add(policy, done);
        }, cb);
      });
    });
  }

  describe('create models for maps/pipelines/policies', function() {
    beforeEach(givenEmptyWorkspace);
    beforeEach(function(done) {
      var serverFacet = this.serverFacet;
      this.configFile = new ConfigFile({
        path: serverFacet + '/policy-config.json'
      });
      async.series([
        createPoliciesAndPipelines,
        function(done) {
          GatewayMap.create({
            name: 'catalog',
            verb: 'GET',
            endpoint: '/api/catalog',
            pipelineId: 'default-pipeline'
          }, done);
        },
        function(done) {
          GatewayMap.create({
            name: 'invoice',
            verb: 'ALL',
            endpoint: '/api/invoices',
            pipelineId: 'default-pipeline'
          }, done);
        }, function(done) {
          GatewayMap.create({
            name: 'order',
            verb: 'ALL',
            endpoint: '/api/orders',
            pipelineId: 'order-pipeline'
          }, done);
        }], done);
    });

    beforeEach(function(done) {
      this.configFile.load(done);
    });

    it('should be able to create multiple maps', function(done) {
      GatewayMap.find(function(err, defs) {
        expect(defs).to.have.length(3);
        done();
      });
    });

    it('should be able to create multiple policies', function(done) {
      Policy.find(function(err, defs) {
        expect(defs).to.have.length(3);
        done();
      });
    });

    it('should be able to create multiple pipelines', function(done) {
      Pipeline.find(function(err, defs) {
        expect(defs).to.have.length(1);
        done();
      });
    });

    it('should be able to rename a policy', function(done) {
      Policy.rename('auth-catalog', 'auth-catalog-1', function(err, policy) {
        if (err) return done(err);
        Pipeline.find(function(err, defs) {
          expect(defs).to.have.length(1);
          expect(defs[0].policyIds).to.contain('auth-catalog-1');
          done();
        });
      });
    });

    it('should be able to rename a pipeline', function(done) {
      Pipeline.rename('default-pipeline', 'default-pipeline-1', function(err, pipeline) {
        if (err) return done(err);
        GatewayMap.find(function(err, defs) {
          expect(defs).to.have.length(3);
          defs.forEach(function(m) {
            if (m.name !== 'order') {
              expect(m.pipelineId).to.eql('default-pipeline-1');
            }
          });
          done();
        });
      });
    });

  });
});
