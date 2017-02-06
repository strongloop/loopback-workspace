'use strict';

module.exports = function() {
  return function injectParams(req, res, next) {
    req.raw = '<xml>params</xml>';
    next();
  };
};
