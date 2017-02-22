#!/usr/bin/env node
// Copyright IBM Corp. 2014,2016. All Rights Reserved.
// Node module: loopback-workspace
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT
'use strict';

const async = require('async');
const config = require('./config.json');

// The script creates a database and login credentials
module.exports = function() {
  const mysql = require('mysql');
  const read = require('read');
  if (!process.env.CI)
    return;
  // setup MySQL database
  let connection, password;
  async.series([
    function askForPassword(next) {
      if (process.env.CI) {
        password = '';
        return next();
      }
      read({
        prompt: 'Enter password for MySQL root user:',
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

      console.log('Connecting');
      connection.connect(next);
    },
    function createDatabase(next) {
      console.log('Creating database %s', config.DATABASE);
      connection.query('CREATE DATABASE IF NOT EXISTS ' +
        config.DATABASE, next);
    },
    function createUser(next) {
      console.log('Creating user %s with password %s',
        config.USER, config.PASSWORD);
      connection.query('GRANT ALL PRIVILEGES  ON ' +
        config.DATABASE +
        '.*' +
        ' TO "' +
        config.USER +
        '"@"localhost" IDENTIFIED BY "' +
        config.PASSWORD + '"' +
        ' WITH GRANT OPTION',
        next);
    },
  ], function(err) {
    connection.end();
    if (err) {
      console.error('Setup failed. %s', err);
      process.exit(1);
    } else {
      console.log('Done.');
      process.exit(0);
    }
  });
};

