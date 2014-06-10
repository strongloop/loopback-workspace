var app = require('../app');
var Definition = app.models.Definition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('Definition', function() {
  describe('definition.toConfig()', function() {
    it('Return the object in its form to be written to config.**Note:** sub-classes should override this method to customizehow they are written to a config file.', function() {

    });
  });

  describe('Definition.fromConfig()', function() {
    it('Constructs the `Definition` from the serialized config value.**Note:** sub-classes should override this method to customizehow they are read to from config file.', function() {

    });
  });

  describe('definition.touch()', function() {
    it('Called internally when underlying config has been `touched`.', function() {

    });
  });

  describe('definition.getDir()', function() {
    it('Get the absolute directory that contains the `Definition`.', function() {

    });
  });
});
