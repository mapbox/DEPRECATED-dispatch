'use strict';

const lambdaCfn = require('lambda-cfn');
const message = require('lambda-cfn').message;
const decrypt = require('../lib/utils.js').decrypt;
const splitOnComma = require('lambda-cfn').splitOnComma;
const getEnv = require('lambda-cfn').getEnv;


module.exports.fn = function(event, context, callback) {
  // decrypt the environment
  decrypt(process.env, function(err, res) {
    if (err) throw err;
    const PDApiKey = process.env.dispatchIncomingPagerDutyApiKey;
    const PDServiceId = process.env.dispatchIncomingPagerDutyServiceId;
    const PDFromAddress = process.env.dispatchIncomingPagerDutyFromAddress;
    const GithubRepo = process.env.dispatchIncomingGithubRepo;
    const GithubOwner = process.env.dispatchIncomingGithubOwner;
    const GithubToken = process.env.dispatchIncomingGithubToken;

    let priority = JSON.parse(event.Records[0].Sns.Message).priority

    if (priority != 'self-service') {
      // create PD incident
      var pd = require('../lib/pagerduty.js').createIncident;
      var options = {
        accessToken: PDApiKey,
        title: 'this is a test', // TODO get the title from webhook event
        serviceId: PDServiceId,
        incidentKey: 'testing', // TODO get the incident key from webhook event
        from: PDFromAddress
      };
      var incident = pd(options);
      incident
      .then(value => { callback(null, 'pagerduty incident triggered'); })
      .catch(error => { callback(error, 'error handled'); });
    }
    // create GH issue
    else if (priority == 'self-service') {
      var gh = require('../lib/github.js')
      var options = {
        owner: GithubOwner,
        repo: GithubRepo,
        token: GithubToken,
        user: 'null', // TODO get from SNS
        title: 'foobar',
        body: 'hurry hurry'
      }
      gh.createIssue(options)
      .then(res => callback(null, res.githubIssue))
      .catch(err => {
        console.log(err);
        callback(err, 'error handled');
        process.exit(1);
      });
    } else {
      callback(null, 'unhandled response');
    }
  });
};
