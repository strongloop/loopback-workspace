'use strict';
const async = require('async');
const EventEmitter = require('events');

class Processor extends EventEmitter {
  constructor() {
    super();
    const concurrency = 1;
    this.queue = async.queue(this.executor, concurrency);
    this.on('execute', this.execute);
  }
  executor(task, next) {
    async.series(task.list, function(err, data) {
      task.callback(err, data);
      next();
    });
  }
  createTask(callback) {
    return new Task(callback);
  }
  execute(task) {
    this.queue.push(task);
  }
}

class Task {
  constructor(cb) {
    this.list = [];
    this.callback = cb;
  }
  addFunction(f) {
    this.list.push(f);
  }
}

module.exports = Processor;
