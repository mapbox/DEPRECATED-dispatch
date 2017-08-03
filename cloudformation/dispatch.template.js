var lambdaCfn = require('lambda-cfn');

module.exports = lambdaCfn(
  [
    'rules/dispatch-incoming.js',
    'rules/dispatch-triage.js'
  ], {
    "AWSTemplateFormatVersion": "2010-09-09",
    "Description": "dispatch"
  }
);
