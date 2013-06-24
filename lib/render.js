// var handlebars = require('handlebars');
var hogan = require('hogan.js');

/**
 * A simple wrapper to abstract the templating implementation away from the rest of the code.
 *
 * @param  {String} template The template to fill.
 * @param  {Object} data     The data to fill with.
 * @return {String}          The rendered output.
 */
function render(template, data) {
  // return Handlebars.compile(template)(data);
  return hogan.compile(template).render(data);
}

module.exports = render;
