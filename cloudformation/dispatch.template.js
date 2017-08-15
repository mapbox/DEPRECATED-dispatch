var lambdaCfn = require('lambda-cfn');

module.exports = lambdaCfn(
  [
    'rules/incoming.js',
    'rules/triage.js'
  ], {
    "AWSTemplateFormatVersion": "2010-09-09",
    "Description": "dispatch"
  }
);
