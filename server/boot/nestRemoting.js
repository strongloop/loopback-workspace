'use strict';

module.exports = function initNestRouting(app) {
  app.models.ModelDefinition.nestRemoting('properties');
};
