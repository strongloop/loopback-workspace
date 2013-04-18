/**
 * Expose `AsteroidProjectManager`.
 */

module.exports = AsteroidProjectManager;

/**
 * Module dependencies.
 */
 
var EventEmitter = require('events').EventEmitter
  , debug = require('debug')('asteroid-project-manager')
  , util = require('util')
  , inherits = util.inherits
  , assert = require('assert');
  
/**
 * Create a new `AsteroidProjectManager` with the given `options`.
 *
 * @param {Object} options
 * @return {AsteroidProjectManager}
 */

function AsteroidProjectManager(options) {
  EventEmitter.apply(this, arguments);
  
  // throw an error if args are not supplied
  // assert(typeof options === 'object', 'AsteroidProjectManager requires an options object');
  
  this.options = options;
  
  debug('created with options', options);
}

/**
 * Inherit from `EventEmitter`.
 */

inherits(AsteroidProjectManager, EventEmitter);

/**
 * Simplified APIs
 */

AsteroidProjectManager.create =
AsteroidProjectManager.createAsteroidProjectManager = function () {
  // add simplified construction / sugar here
  return new AsteroidProjectManager();
}

/**
 * Methods.
 */
 
AsteroidProjectManager.prototype.myMethod = function () {
  throw new Error('AsteroidProjectManager.myMethod not implemented');
}