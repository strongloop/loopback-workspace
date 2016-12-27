'use strict';
const async = require('async');
const EventEmitter = require('events');

class Processor extends EventEmitter {
  constructor() {
    super();
    this.queue = async.queue(this.executor, 1);
    this.on('execute', this.execute);
  }
  executor(task, next) {
    async.series(task.list, function(err, data) {
      if (err) {
        task.callBack(err);
        next();
      } else {
        task.callBack(null, data);
        next();
      }
    });
  }
  createTask(callBack) {
    return new Task(callBack);
  }
  execute(task) {
    this.queue.push(task);
  }
}

class Task {
  constructor(cb) {
    this.list = [];
    this.callBack = cb;
  }
  addFunction(f) {
    this.list.push(f);
  }
}

module.exports = Processor;
