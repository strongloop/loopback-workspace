// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

module.exports = function(grunt) {
  // Project configuration.
  grunt.initConfig({
    loopback_sdk_angular: {
      services: {
        options: {
          input: './server/server.js',
          output: './dist/workspace.js',
        },
      },
    },
    docular: {
      groups: [
        {
          groupTitle: 'LoopBack',
          groupId: 'loopback',
          sections: [
            {
              id: 'lbServices',
              title: 'LoopBack Services',
              scripts: ['dist/workspace.js'],
            },
          ],
        },
      ],
    },
    eslint: {
      gruntfile: {
        src: 'Gruntfile.js',
      },
      bin: {
        src: ['bin/**/*.js'],
      },
      client: {
        src: ['client/**/*.js'],
      },
      common: {
        src: ['common/**/*.js'],
      },
      server: {
        src: ['server/**/*.js'],
      },
      templates: {
        src: ['templates/**/*.js'],
      },
      test: {
        src: ['test/**/*.js'],
      },
    },
  });

  grunt.loadNpmTasks('grunt-loopback-sdk-angular');
  grunt.loadNpmTasks('grunt-docular');
  grunt.loadNpmTasks('grunt-eslint');

  grunt.registerTask('default', ['loopback_sdk_angular', 'docular', 'eslint']);
};
