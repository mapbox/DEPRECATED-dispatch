'use strict';

var lambdaCfn = require('lambda-cfn');
var message = require('lambda-cfn').message;
var dke = require('decrypt-kms-env');
var splitOnComma = require('lambda-cfn').splitOnComma;
var getEnv = require('lambda-cfn').getEnv;

module.exports.fn = function(event, context, callback) {
  // decrypt the environment
  dke(process.env, function(err, scrubbed) {
    if (err) throw err;
    const PDApiKey = process.env.dispatchIncomingPagerDutyApiKey;
    const PDServiceId = process.env.dispatchIncomingPagerDutyServiceId;
    const PDFromAddress = process.env.dispatchIncomingPagerDutyFromAddress;
    const GithubRepo = process.env.dispatchIncomingGithubRepo;
    const GithubOwner = process.env.dispatchIncomingGithubOwner;
    const GithubToken = process.env.dispatchIncomingGithubToken;

    var priority = JSON.parse(event.Records[0].Sns.Message).priority

    if (priority != 'self-service') {
      // create PD incident
      var pd = require('../lib/pagerduty.js');
      var options = {
        accessToken: PDApiKey,
        title: 'the server is on fire', // TODO get the title from webhook event
        serviceId: PDServiceId,
        incidentKey: 'testing', // TODO get the incident key from webhook event
        from: PDFromAddress
      };
      var incident = pd(options);
      incident
      .then(value => { callback(null, 'incident triggered'); })
      .catch(error => { callback(error, 'error handled'); });
    }
    // create GH issue
    else if (priority == 'self-service') {
      var gh = require('../lib/github.js')
      var options = {
        owner: GithubOwner,
        repo: GithubRepo,
        token: GithubToken,
        user: 'oliikit', // TODO get from SNS
        title: 'there is a fire',
        body: 'hurry hurry'
      }
      gh.createIssue(options).catch(err => callback(err, 'error handled'));
    } else {
      callback(null, 'unhandled response');
    }
  });
};
