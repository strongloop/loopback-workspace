'use strict';

module.exports = function() {
  return function logError(err, req, res, next) {
    console.log('ERR', req.url, err);
  };
};
