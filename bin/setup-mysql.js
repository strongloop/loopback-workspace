#!/usr/bin/env node
// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var async = require('async');
var mysql = require('mysql');
var read = require('read');

// Run this script once to setup your MySQL database for unit-tests
// The script creates a database and login credentials

DATABASE = 'loopback_workspace_test';
USER = 'lbws';
PASSWORD = 'hbx42rec';

var connection;
async.series([
  function setupConnection(next) {
    read({
      prompt: 'Enter password for MySQL root user:',
      silent: true,
    }, function(err, password) {
      if (err) return next(err);

      connection = mysql.createConnection({
        user: 'root',
        password: password,
      });

      console.log('Connecting');
      connection.connect(next);
    });
  },
  function createDatabase(next) {
    console.log('Creating database', DATABASE);
    connection.query('CREATE DATABASE IF NOT EXISTS ' + DATABASE, next);
  },
  function createUser(next) {
    console.log('Creating user %s with password %s', USER, PASSWORD);
    connection.query('GRANT ALL PRIVILEGES  ON ' + DATABASE + '.*' +
        ' TO "' + USER + '"@"localhost" IDENTIFIED BY "' + PASSWORD + '"' +
        ' WITH GRANT OPTION',
      next);
  },
], function(err) {
  connection.end();
  if (err) {
    console.error('Setup failed.', err);
    process.exit(1);
  } else {
    console.log('Done.');
    process.exit(0);
  }
});
