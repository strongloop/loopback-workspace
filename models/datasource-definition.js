var app = require('../');
var DatasourceDefinition = app.models.DatasourceDefinition;

DatasourceDefinition.validatesPresenceOf('name', 'connector');
