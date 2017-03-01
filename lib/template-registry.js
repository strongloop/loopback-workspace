// Copyright IBM Corp. 2015,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const async = require('async');
const fs = require('fs-extra');
const extend = require('lodash').mergeWith;
const path = require('path');

class TemplateRegistry {
  constructor() {
    this.templates = {};
  }
  loadTemplates(callback) {
    const registry = this;
    const templates = this.templates;
    const dir = path.resolve(__dirname, '../', 'templates/config');
    const tasks = [];
    const files = [];
    const nodes = {};

    tasks.push(function(next) {
      registry.getTemplateFilePaths(files, dir, next);
    });
    tasks.push(function(next) {
      registry.readTemplateFiles(files, nodes, next);
    });
    tasks.push(function(next) {
      registry.createTemplates(nodes, templates, next);
    });
    async.series(tasks, callback);
  }
  getTemplate(name) {
    return this.templates[name];
  }
  getTemplateFilePaths(files, dir, next) {
    fs.readdir(dir, function(err, items) {
      if (err) return next(err);
      items.forEach(function(item) {
        const filePath = path.resolve(dir, item);
        if (fs.lstatSync(filePath).isFile()) {
          files.push(filePath);
        }
      });
      next();
    });
  }
  readTemplateFiles(files, nodes, callback) {
    const registry = this;
    let index = 0;
    files.forEach(function(filePath) {
      fs.readJson(filePath, function(err, jsonData) {
        if (err) return callback(err);
        nodes[jsonData.name] = new TreeNode(jsonData);
        index++;
        if (index === files.length) {
          return callback(null, 'templates are loaded');
        }
      });
    });
  }
  createTemplates(nodes, templates, next) {
    const registry = this;
    // create tree
    const tree = new InheritanceTree(nodes);
    // walk thru children of root node
    tree.root.children.forEach(function(child) {
      templates[child.name] = child.data;
      tree.walkTree(child, templates, extendParent);
    });
    // function to apply to each node
    function extendParent(childNode, templates) {
      let parent = templates[childNode.parent.name];
      let child = childNode.data;
      // extend child with parent
      templates[childNode.name] = extend({}, parent, child, customizer);
      // include parents list of directories to copy
      let dirList = (parent.dirList) ? [].concat(parent.dirList) : [];
      dirList.push(parent.files.path);
      templates[childNode.name].dirList = dirList;
    }
    // customize extension for arrays
    function customizer(objValue, srcValue) {
      if (Array.isArray(objValue)) {
        return objValue.concat(srcValue);
      }
    }
    next();
  }
}

class InheritanceTree {
  constructor(treeNodes) {
    const tree = this;
    // Root node
    this.root = new TreeNode('');
    // Link the nodes together based on inheritance
    Object.keys(treeNodes).forEach(function(key) {
      let node = treeNodes[key];
      node.parent = node.data.extends &&
        treeNodes[node.data.extends] || null;
      // Connect with a parent
      if (node.parent)
        node.parent.children.push(node);
      else
        tree.root.children.push(node);
    });
  }
  /**
   * walks thru the tree from a particular node.
   *
   * @node - node to start
   * @templates - templates cache
   * @f - function to apply to each node
   */
  walkTree(node, templates, f) {
    const tree = this;
    node.children.forEach(function(childNode) {
      f.apply(tree, [childNode, templates]);
      tree.walkTree(childNode, templates, f);
    });
  }
}

class TreeNode {
  constructor(data) {
    this.name = data.name;
    this.data = data;
    this.parent   = null;
    this.children = [];
  }
}

const templateRegistry = new TemplateRegistry();

module.exports = templateRegistry;
