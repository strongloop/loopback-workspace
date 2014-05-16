var app = require('../');
var PropertyDefinition = app.models.ModelPropertyDefinition;

PropertyDefinition.validatesUniquenessOf('name', { scopedTo: ['modelId'] });
PropertyDefinition.validatesPresenceOf('name', 'type');

/**
 * Convert a list of property definitions to a `properties` object
 * for models.json.
 *
 * @param {Array.<PropertyDefinition>} properties
 * @param {function(Error=,Object)} cb
 * @return {Object}
 */
PropertyDefinition.arrayToConfigObject = function(properties, cb) {
  var result = properties.reduce(function(prev, val) {
    var data = val.toObject();
    var name = data.name;
    delete data.id;
    delete data.name;
    delete data.modelId;
    prev[name] = data;
    return prev;
  }, {});
  cb(null, result);
};
