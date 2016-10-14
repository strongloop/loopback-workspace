#!/usr/bin/env node
// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

var g = require('strong-globalize')();
var async = require('async');
var mysql = require('mysql');
var read = require('read');

// Run this script once to setup your MySQL database for unit-tests
// The script creates a database and login credentials

DATABASE = 'loopback_workspace_test';
USER = 'lbws';
PASSWORD = 'hbx42rec';

if (process.argv.indexOf('--ci-only') !== -1 && !process.env.CI)
  return;

var connection, password;
async.series([
  function askForPassword(next) {
    if (process.env.CI) {
      password = '';
      return next();
    }
    read({
      prompt: g.f('Enter password for MySQL root user:'),
      silent: true,
    }, function(err, pwd) {
      if (err) return next(err);
      password = pwd;
      next();
    });
  },
  function setupConnection(next) {
    connection = mysql.createConnection({
      user: 'root',
      password: password,
    });

    g.log('Connecting');
    connection.connect(next);
  },
  function createDatabase(next) {
    g.log('Creating database %s', DATABASE);
    connection.query('CREATE DATABASE IF NOT EXISTS ' + DATABASE, next);
  },
  function createUser(next) {
    g.log('Creating user %s with password %s', USER, PASSWORD);
    connection.query('GRANT ALL PRIVILEGES  ON ' + DATABASE + '.*' +
        ' TO "' + USER + '"@"localhost" IDENTIFIED BY "' + PASSWORD + '"' +
        ' WITH GRANT OPTION',
      next);
  },
], function(err) {
  connection.end();
  if (err) {
    g.error('Setup failed. %s', err);
    process.exit(1);
  } else {
    g.log('Done.');
    process.exit(0);
  }
});
