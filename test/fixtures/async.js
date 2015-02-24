module.exports = function(app, cb) {
  app.asyncBoot = typeof cb === 'function';
  process.nextTick(cb);
};
