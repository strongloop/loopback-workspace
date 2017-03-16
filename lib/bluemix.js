'use strict';

var request = require('request');
var util = require('util');

var defaultApiURL = 'https://api.ng.bluemix.net';

function listApps(accessToken, options, cb) {
  if (typeof options === 'function' && cb === undefined) {
    cb = options;
    options = {};
  }
  var apiURL = options.apiURL || defaultApiURL;
  var tokenType = options.tokenType || 'bearer';
  var appsURL = apiURL + '/v2/apps';
  request.get({
    uri: appsURL,
    headers: {
      Accept: 'application/json;charset=utf-8',
      Authorization: tokenType + ' ' + accessToken
    },
    json: true
  }, cb);
}

function login(userId, password, options, cb) {
  if (typeof options === 'function' && cb === undefined) {
    cb = options;
    options = {};
  }

  var apiURL = options.apiURL || defaultApiURL;
  var infoURL = options.infoURL || apiURL + '/info';

  request.get({
    uri: infoURL,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    json: true
  }, function(err, res) {
    if (err) return cb(err);
    var authURL = res.body.authorization_endpoint ||
      'https://login.ng.bluemix.net/UAALoginServerWAR';
    var tokenURL = authURL + '/oauth/token';
    var body = 'grant_type=password&username=' + userId
      + '&password=' + password;
    request.post({
      uri: tokenURL,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        Accept: 'application/json;charset=utf-8',
        Authorization: 'Basic Y2Y6'
      },
      body: body,
      json: true,
    }, function(err, res) {
      if (err) return cb(err);

      listApps(accessToken, cb);
    });
  });
}

login('your-email', 'your-password', function(err, res) {
  if (err) {
    console.error(err);
    return;
  }
  var accessToken = res.body.access_token;
  var tokenType = res.body.token_type;
  listApps(res.body.access_token, function(err, res) {
    console.log(util.inspect(res.body, {depth: null}));
  });
});
