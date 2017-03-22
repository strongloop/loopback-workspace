'use strict';

module.exports = function mixin(target, source) {
<<<<<<< 538c9a386b8997bffaab0a685afccd30af2f45f5
  const properties = Object.getOwnPropertyNames(source);
  properties.forEach(function(propertyName) {
    if (propertyName === 'constructor') return;
    if (typeof source[propertyName] === 'function') {
      const sourceProperty = source[propertyName];
      target[propertyName] = sourceProperty;
=======
  const attributes = Object.getOwnPropertyNames(source);
  attributes.forEach(function(ix) {
    if (ix === 'constructor') return;
    if (typeof source[ix] === 'function') {
      const mx = source[ix];
      target[ix] = mx;
>>>>>>> Add create action to model
    }
  });
};
