var app = require('../app');
var Definition = app.models.Definition;
var TestDataBuilder = require('loopback-testing').TestDataBuilder;

describe('Definition', function() {
  describe('file sync', function() {
    describe('Definition.loadFromFs()', function () {
      it('should be called when finding a model', function (done) {
        var called = false;
        Definition.loadFromFs = function(cb) {
          expect(cb).to.be.a(Function);
          called = true;
          cb();
        }
        Definition.find(function() {
          expect(called).to.equal(true);
          done();
        });

        console.log(Definition.find.toString())
      });
    });
  });
});
