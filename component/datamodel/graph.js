'use strict';

export class Graph {
  constructor() {
    this._cache = {};
  }

  addDomain(name) {
    this._cache[name] = {
      _nodes: {
      }
    };
  }

  addNode(node) {
    var domain = node._domain;  
    var name = node._name;
    this._cache[domain][name] = node;
  }  

  getNode(domain, name) {
    return this._cache[domain][name];
  }
}

export class Node {
  constructor(graph, domain, name, data) {
    this._graph = graph;
    this._name = name;
    this._content = data;
    this._domain = domain;
  }
} 
