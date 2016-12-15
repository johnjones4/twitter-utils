const request = require('request');
const async = require('async');

const delay = 60000;

exports.requestQueue = [];

setInterval(function() {
  if (exports.requestQueue.length > 0) {
    const next = exports.requestQueue.shift();
    console.log(next.params.operation);
    request({
      'uri': 'https://api.twitter.com/1.1' + next.params.operation,
      'qs': next.params.qs,
      'useQuerystring': true,
      'json': true,
      'oauth': {
        'consumer_key': exports.config.twitter.consumerKey,
        'consumer_secret': exports.config.twitter.consumerSecret,
        'token': exports.config.twitter.token,
        'token_secret': exports.config.twitter.tokenSecret
      }
    },next.callback);
  }
},delay);

exports.config = null;
