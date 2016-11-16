var DataGraph = require('./datagraph.js').Graph;

module.exports = Workspace;

function Workspace(id, rootFolder, cacheObject) {
  this._graph = new DataGraph(id, cacheObject);
  this._path = rootFolder;
  this._graph.addDomain("Facet");
  this._graph.addDomain("FacetConfig");
  this._graph.addDomain("ModelDefinition");
  this._graph.addDomain("ModelRelation");
  this._graph.addDomain("ModelProperty");
  this._graph.addDomain("ModelConfig");
  this._graph.addDomain("DataSources");
  this._graph.addDomain("Middleware");
  this._graph.addDomain("MiddlewarePhases");
  this._graph.addDomain("FileVersions");
  this._graph.addDomain("ConfigFile");
  this._middlewarePhases = [];
  var initialPhase = this._graph.createNode("Middleware", "initial", {}, false);
  var sessionPhase = this._graph.createNode("Middleware", "session", {}, false);
  var authPhase = this._graph.createNode("Middleware", "auth", {}, false);
  var parsePhase = this._graph.createNode("Middleware", "parse", {}, false);
  var routesPhase = this._graph.createNode("Middleware", "routes", {}, false);
  var filesPhase = this._graph.createNode("Middleware", "files", {}, false);
  var finalPhase = this._graph.createNode("Middleware", "final", {}, false);
  this._middlewarePhases.push(initialPhase);
  this._middlewarePhases.push(sessionPhase);
  this._middlewarePhases.push(authPhase);
  this._middlewarePhases.push(parsePhase);
  this._middlewarePhases.push(routesPhase);
  this._middlewarePhases.push(filesPhase);
  this._middlewarePhases.push(finalPhase);
}

Workspace.prototype.addFacet = function (id, value, loadFlag) {
  var facet = this._graph.createNode("Facet", id, value, !loadFlag);
}

Workspace.prototype.addFacetConfig = function (facetName, id, value, loadFlag) {
  var facetConfig = this._graph.createNode("FacetConfig", id, value, !loadFlag);
  var facet = this._graph.getNode("FacetConfig", facetName);
  var link = this.graph.addLink(id, "FacetSettings", {}, facet, facetConfig, !loadFlag);
}

Workspace.prototype.addModel = function (id, modelDef, configFile, modelConfig, loadFlag) {
  var model = this._graph.createNode("ModelDefinition", id, modelDef, !loadFlag);
  var file = this._graph.createNode("ConfigFile", id, configFile, !loadFlag);
  var modelConfigNode = this._graph.getNode("ModelConfig", id);
  var link = this.graph.addLink(id, "ModelConfig", modelConfig, model, modelConfigNode, !loadFlag);
  var fileVersionLink = this.graph.addLink(id, "FileVersions", {}, model, file, !loadFlag);
}

Workspace.prototype.loadModelConfig = function (id, configFile) {
  var modelConfigFile = this._graph.createNode("ConfigFile", id, configFile, !loadFlag);
  return modelConfigFile;
}

Workspace.prototype.addModelConfig = function (id, modelConfig) {
  var modelConfigNode = this._graph.createNode("ModelConfig", id, modelConfig);
  return modelConfigNode;
}

Workspace.prototype.addDataSource = function (id, DataSource, configFile) {
  var dataSource = this._graph.createNode("DataSources", id, DataSource, !loadFlag);
  var file = this._graph.createNode("ConfigFile", id, configFile, !loadFlag);
  var link = this.graph.addLink(id, "FileVersions", {}, dataSource, file, !loadFlag);
}

Workspace.prototype.addMiddleware = function(Middleware, configFile, loadFlag) {
  var file = this._graph.createNode("ConfigFile", "Middleware", configFile, !loadFlag);
  var middlewareDefs = configFile.data || {};
  var phases = Object.keys(middlewareDefs);
  phases.forEach(function(phaseName) {
    var phase = middleware[phaseName];
    var middlewareNode = this._graph.getNode("Middleware", phaseName);
    for (var d in phase) {
      def = defs[d];
      var defList = def;
      if (!Array.isArray(def)) {
        defList = [def];
      }
      // The middleware value can be an array
      for (var i = 0, n = defList.length; i < n; i++) {
        var md = defList[i];
        md.configFile = configFile.path;
        md.phase = phase;
        md.subPhase = subPhase;
        md.facetName = facetName;
        md.name = d;
        md.index = i;
        debug('loading [%s] middleware into cache: %j', md.name, md);
        var phaseNode = this._graph.createNode("MiddlewarePhases", d, md, !loadFlag);
        var link = this.graph.addLink(id, "FileVersions", {}, phaseNode, file, !loadFlag);
        var phaseLink = this.graph.addLink(id, "Phases", {}, middlewareNode, phaseNode, !loadFlag);
      }
    }
  });
}

Workspace.prototype.addRelation = function (modelName, id, relationData, relatedModel) {   
  var fromModel = this._graph.getNode("ModelDefinition", modelName, !loadFlag);
  var toModel = this._graph.getNode("ModelDefinition", relatedModel, !loadFlag);
  var link = this.graph.addLink(id, "ModelRelation", relationData, fromModel, toModel, !loadFlag);
}

Workspace.prototype.addProperty = function (modelName, id, data) {
  var model = this._graph.getNode("ModelDefinition", modelName, !loadFlag);
  var property = this._graph.createNode("ModelProperty", id, data, !loadFlag);
  var link = this.graph.addLink(id, "ModelProperty", {}, model, property, !loadFlag);
}

Workspace.prototype.addMethod = function (modelName, id, data) {
  var model = this._graph.getNode("ModelDefinition", modelName, !loadFlag);
  var method = this._graph.createNode("ModelMethod", id, data, !loadFlag);
  var link = this.graph.addLink(id, "ModelMethod", {}, model, method, !loadFlag);
}

Workspace.prototype.updateModel = function (modelName, id, ModelDefinition) {
  var model = this._graph.updateNode("ModelDefinition", id, ModelDefinition);
}

Workspace.prototype.updateProperty = function (modelName, id, ModelProperty) {
  var model = this._graph.updateNode("ModelProperty", id, ModelProperty);
}

Workspace.prototype.updateMethod = function (modelName, id, ModelMethod) {
  var model = this._graph.updateNode("ModelMethod", id, ModelProperty);
}

Workspace.prototype.removeRelation = function (modelName, id) {
  var model = this._graph.getNode("ModelDefinition", modelName);
  var relation = model.getLink("ModelRelation", id);
  relation.remove();
}

Workspace.prototype.removeProperty = function (id) {
  var model = this._graph.deleteNode("ModelProperty", id);
}

Workspace.prototype.removeMethod = function (id) {
  var model = this._graph.deleteNode("ModelMethod", id);
}

Workspace.prototype.removeModel = function (id) {
  var model = this._graph.getNode("ModelDefinition", id);
  var outLinks = model._outboundLinks;
  for (var key in outLinks) {
    outLinks[key].remove();
  }
  var inLinks = model._inboundLinks;
  for (var key in inLinks) {
    inLinks[key].remove();
  }
  this._graph.deleteNode("ModelDefinition", id);
}