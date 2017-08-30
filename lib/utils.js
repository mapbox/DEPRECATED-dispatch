'use strict';
var dke = require('decrypt-kms-env');
var base64url = require('base64url');
var crypto = require('crypto');


module.exports.decrypt = decrypt;

function decrypt(env, callback) {
  if (process.env.NODE_ENV === 'test') {
    callback(null, 'FakeApiToken');
  } else {
    dke(env, function(err, scrubbed) {
      if (err) throw err;
      callback(null, scrubbed);
    });
  }
}

module.exports.encode = encode;

function encode(data, callback) {
  if (!data.github) {
    return callback('No github issue found for slack callback_id creation');
  }
  if (!data.requestId) {
    data.requestId = crypto.randomBytes(6).toString('hex');
  }
  return callback(null, base64url(JSON.stringify(data)));
}

module.exports.decode = decode;

function decode(slackCallbackId, callback) {
  var data;
  try {
    data = JSON.parse(base64url.decode(slackCallbackId));
  } catch (e) {
    return callback('Parse error on Slack callback_id');
  }
  return callback(null, data);
};
