'use strict';

const dke = require('decrypt-kms-env');
const base64url = require('base64url');
const crypto = require('crypto');

/**
 * Decrypt environment via dke
 *
 * @param {object} env - environment
 * @param {function} callback - returns err, decrypted env
 */
function decrypt(env, callback) {
  if (process.env.NODE_ENV === 'test') {
    callback(null, 'scrubbed');
  } else {
    dke(env, function(err, scrubbed) {
      if (err) throw err;
      callback(null, scrubbed);
    });
  }
}

/**
 * Encode data via Base64
 *
 * @param {object} data - data to be encoded
 * @param {function} callback - returns err, encoded data
 */
function encode(data, callback) {
  if (!data.github) {
    return callback('no github issue found for slack callback_id creation');
  }
  if (!data.requestId) {
    data.requestId = crypto.randomBytes(6).toString('hex');
  }
  return callback(null, base64url(JSON.stringify(data)));
}

/**
 * Decode Base64 encoded data
 *
 * @param {object} slackCallbackId - encoded data
 * @param {function} callback - returns err, decoded data
 */
function decode(slackCallbackId, callback) {
  let data;
  try {
    data = JSON.parse(base64url.decode(slackCallbackId));
  } catch (e) {
    return callback('parse error on Slack callback_id');
  }
  return callback(null, data);
};

module.exports.decrypt = decrypt;
module.exports.encode = encode;
module.exports.decode = decode;