var app = require('../');
var ModelDefinition = app.models.ModelDefinition;
var PropertyDefinition = app.models.ModelPropertyDefinition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;
var expect = require('chai').expect;

describe('PropertyDefinition', function() {
  it('validates `name` uniqueness', function(done) {
    var ref = TestDataBuilder.ref;
    new TestDataBuilder()
      .define('model', ModelDefinition)
      .define('prop1', PropertyDefinition, {
        name: 'prop-name',
        modelId: ref('model.id')
      })
      .define('prop2', PropertyDefinition, {
        name: ref('prop1.name'),
        modelId: ref('prop1.modelId')
      })
      .buildTo({}, function(err) {
        expect(err).to.be.ok;
        expect(err).to.have.property('name', 'ValidationError');
        expect(err.details.codes).to.have.property('name').eql(['uniqueness']);
        done();
      });
  });

  it('validates `name` uniqueness within the model only', function(done) {
    var ref = TestDataBuilder.ref;
    new TestDataBuilder()
      .define('model1', ModelDefinition, {
        name: 'model1'
      })
      .define('model2', ModelDefinition, {
        name: 'model2'
      })
      .define('model1property', PropertyDefinition, {
        name: 'ModelPropertyDefinitionName',
        modelId: ref('model1.id')
      })
      .define('model2property', PropertyDefinition, {
        name: ref('model1property.name'),
        modelId: ref('model2.id')
      })
      .buildTo({}, function(err) {
        if (err && err.name === 'ValidationError') {
          err.message += '\nDetails: ' +
            JSON.stringify(err.details.messages, null, 2);
        }
        // The test passes when no error was reported.
        done(err);
      });
  });

  describe('arrayToConfigObject', function() {
    it('creates a list of data objects', function() {
      var props = [new PropertyDefinition({
        name: 'login',
        type: 'string'
      })];

      PropertyDefinition.arrayToConfigObject(props, function(err, config) {
        if (err) return done(err);
        expect(toData(config)).to.eql({
          login: { type: 'string' }
        });
      });
    });
  });
});

function toData(obj) {
  return JSON.parse(JSON.stringify(obj));
}
