'use strict';

module.exports = function mixin(target, source) {
  const properties = Object.getOwnPropertyNames(source);
  properties.forEach(function(propertyName) {
    if (propertyName === 'constructor') return;
    if (typeof source[propertyName] === 'function') {
      const sourceProperty = source[propertyName];
      target[propertyName] = sourceProperty;
    }
  });
};
