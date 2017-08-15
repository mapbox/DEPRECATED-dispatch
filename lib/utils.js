'use strict'
var dke = require('decrypt-kms-env');

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
