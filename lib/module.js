/*!
 * TODO: Description.
 */


/**
 * Creates a new instance of Module with the provided `options`.
 *
 * @param {Object} obj
 */
function Module(obj) {
  if (!(this instanceof Module)) {
    return new Module(obj);
  }

  obj = obj || {};
}

/*!
 * Export `Module`.
 */
module.exports = Module;
