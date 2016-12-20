'use strict';
module.exports = function(grunt) {
  grunt.initConfig({
    cucumberjs: {
      files: 'test',
      options: {
        format: 'pretty',
      },
    },
  });
  grunt.loadNpmTasks('grunt-cucumber');
  grunt.registerTask('default', ['cucumberjs']);
};
