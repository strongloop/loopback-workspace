var AsteroidProjectManager = require('../');

describe('AsteroidProjectManager', function(){
  var asteroidProjectManager;
  
  beforeEach(function(){
    asteroidProjectManager = new AsteroidProjectManager;
  });
  
  describe('.myMethod', function(){
    // example sync test
    it('should <description of behavior>', function() {
      asteroidProjectManager.myMethod();
    });
    
    // example async test
    it('should <description of behavior>', function(done) {
      setTimeout(function () {
        asteroidProjectManager.myMethod();
        done();
      }, 0);
    });
  });
});