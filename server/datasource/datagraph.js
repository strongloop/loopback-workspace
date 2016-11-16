module.exports.Graph = Graph;
module.exports.Node = Node;
module.exports.Link = Link;

function Graph(id, cacheObject) {
    this._changesummary = [];
    this._id = id;
    this._cache = cacheObject;
}

function Node(name, Graph) {
    this._graph = Graph;
    this._name = name;
    this._content = {};
    this._outboundLinks = {};
    this._inboundLinks = {};
} 

function Link(name, type, fromNode, toNode) {
    this._from = fromNode;
    this._to = toNode;
    this._name = name;
    this._linkType = type;
    this._attributes = [];
}

function Change(node, verb, value) {
    this._node = node;
    this._verb = verb;
    this._value = value;
}

function EventListener(changeEvent, handlerFunction) {
    this._changeEvent = changeEvent;
    this._handler = handlerFunction;
}

Graph.prototype.getChangeSummary = function() {
    return this._changesummary;
}

Graph.prototype.addLink = function(name, linkType, attributes, fromNode, toNode, trackChange) {
    var arrow = new Link(name, linkType, fromNode, toNode);
    var linkGroup = null;
    if (linkType) {
      if(fromNode._outboundLinks[linkType]) {
        linkGroup = fromNode._outboundLinks[linkType];
      } else {
        fromNode._outboundLinks[linkType] = {};
        linkGroup = fromNode._outboundLinks[linkType];
      }
    }
    linkGroup[name] = arrow;
    toNode._inboundLinks[name] = arrow;
    if (Array.isArray(attributes)){
      attributes.forEach(function(attr){
        var attrNode = this.createNode(linkType, attr.name, attr, trackChange);
        arrow._attributes.push(attrNode);
      });
    } else {
      var attrNode = this.createNode(linkType, name, attributes, trackChange);
      arrow._attributes.push(attrNode);
    }   
    return arrow;
} 

Graph.prototype.addDomain = function(name) {
    this._cache[name] = {
        _nodes: {
        }
    };
}

Graph.prototype.createNode = function(domain, id, data, trackChange) {
  var root = this._cache[domain];
  var node = new Node(id);
  node._content = data;
  root[id] = node;
  if(trackChange) {
    var change = new Change(this, "create", data);
    this._changesummary.push(change);
  }  
  return node;
}

Graph.prototype.getNode = function(domain, name) {
  return this._cache[domain][name];
}

Graph.prototype.deleteNode = function(domain, name) {
  var root = this._cache[domain];
  var node = root[name];
  var inboundLinks = node._inboundLinks;
  var outboundLinks = node._outboundLinks;
  for(var linkType in inboundLinks) {
    inboundLinksLinks[key].remove();
  }
  for(var linkgroup in outboundLinks) {
    for(var name in outboundLinksLinks[linkgroup]) {
      outboundLinksLinks[linkgroup][name].remove();
    } 
  }
  var change = new Change(this, "delete", data);
  this._changesummary.push(change);
  delete root[name];
}

Graph.prototype.updateNode = function(domain, name, value) {
  this._content = value;
  var change = new Change(this, "update", value);
  this._graph._changesummary.push(change);
} 

Link.prototype.remove = function() {
  var name = this._name;
  var dataNode = this._graph[this._linkType][this._name];
  var change = new Change(this, "delete", dataNode._content);
  delete dataNode;
  delete _from._outboundLinks[this._linkType][name];
  delete _to._inboundLinks[name];
}


/*

function Path(pathString) {
    this._pathString = pathString;
    this._pathArray = pathString.split("/");
}

Path.prototype.getElement = function(parent) {
    var len = this._pathArray.length;
    var child;
    for(var index=0; index < len-1; index++) {
      parent = parent[this._pathArray[index]];
    }
    child = this._pathArray[len-1];
    return parent[child];
}

Path.prototype.setElement = function(parent, value) {
    var len = this._pathArray.length;
    var child;
    for(var index=0; index < len-1; index++) {
      parent = parent[this._pathArray[index]];
    }
    child = this._pathArray[len-1];
    parent[child] = value;
}
*/