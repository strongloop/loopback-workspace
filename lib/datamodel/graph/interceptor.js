'use strict';

const mixin = require('../../util/mixin');

class Interceptor {
  constructor(obj) {
    let self = this;
    addInterceptorFunctions(self, obj);
    self.trackChanges = [];
    return self;
  }
  commit(obj) {
    this.trackChanges.forEach(function(track) {
      obj[track.functionName].apply(obj, track.args);
    });
  }
}

function addInterceptorFunctions(target, source) {
  const properties = allPropertyNames(source);
  properties.forEach(function(name) {
    if (name === 'constructor') return;
    if (typeof source[name] === 'function') {
      const fn = source[name];
      target[name] = function() {
        fn.apply(source, arguments);
        if (name === 'add' || name === 'remove') {
          const args = Array.prototype.slice.call(arguments);
          const trackArgs = [{args: args, functionName: name}];
          track.apply(target, trackArgs);
        }
      };
    }
  });
}

function allPropertyNames(obj) {
  var properties = [];
  do {
    properties = properties.concat(Object.getOwnPropertyNames(obj));
    obj = Object.getPrototypeOf(obj);
  } while (obj);
  return properties;
}

function track(args) {
  this.trackChanges.push(args);
}

module.exports = Interceptor;
