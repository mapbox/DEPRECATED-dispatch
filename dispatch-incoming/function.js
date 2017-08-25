'use strict';

const decrypt = require('../lib/utils.js').decrypt;
const gh = require('../lib/github.js');
const pd = require('../lib/pagerduty.js').createIncident;
const queue = require('d3-queue').queue;
const request = require('request');
const slack = require('../lib/slack.js');
const webClient = require('@slack/client').WebClient;

module.exports.fn = function(event, context, callback) {
  // decrypt the environment
  decrypt(process.env, function(err, res) {
    if (err) throw err;
    const pagerDutyApiKey = process.env.PagerDutyApiKey;
    const pagerDutyServiceId = process.env.PagerDutyServiceId;
    const pagerDutyFromAddress = process.env.PagerDutyFromAddress;
    const githubRepo = process.env.GithubRepo;
    const githubOwner = process.env.GithubOwner;
    const githubToken = process.env.GithubToken;
    const slackBotToken = process.env.SlackBotToken;
    const slackChannel = process.env.SlackChannel;
    const oracleUrl = process.env.OracleUrl;
    const oracleSecret = process.env.OracleSecret;
    let users;
    if (event.Records.length > 1) {
      return callback('SNS message contains more than one record', null);
    } else {
      oracle(function(err,data) {
        if (err) return callback(err);
        incoming(function(err,data) {
          if (err) return callback(err);
          return callback(null, data);
        });
      });
    };

    function oracle(callback) {
      let message = JSON.parse(event.Records[0].Sns.Message);
      let msgType = message.type;
      let messageUsers = message.users;
      if (msgType === 'high') {
        console.log('High priority message, skipping Oracle');
        return callback();
      } else if (messageUsers.length > 1) {
        users = messageUsers;
        console.log('Users array contains more than one user, skipping Oracle');
        return callback();
      } else if (process.env.NODE_ENV === 'test') {
        users = [ 'testUser' ];
        return callback();
      } else {
        if (oracleUrl) {
          let oracleCall = {
            url: oracleUrl,
            qs: { query: messageUsers[0] }
          };
          if (oracleSecret) {
            oracleCall.headers = {
              'x-api-key': oracleSecret
            };
          }
          console.log('querying Oracle for: ' + messageUsers[0]);
          request.get(oracleCall, function(err, response, body) {
            if (err) return callback(err);
            body = JSON.parse(body);
            if (body && body.github === 'mapbox/security-team') {
              console.log('Oracle query returned no results for: ' + messageUserName);
              users = [ body.github ];
              return callback();
            }
            console.log('Oracle replied: ' + body.github);
            users = [ body.github ];
            return callback();
          });
        } else {
          users = messageUsers;
          return callback();
        }
      }
    };

    function incoming(callback) {
      let message = JSON.parse(event.Records[0].Sns.Message);
      let msgType = message.type;
      const client = new webClient(slackBotToken);
      if (!msgType) {
        return callback(null, 'unhandled response, no priority found in message');
      } else if (msgType === 'self-service') {
        let options = {
          owner: githubOwner,
          repo: githubRepo,
          token: githubToken,
          user: message.users[0],
          title: message.body.github.title,
          body: message.body.github.body + '\n\n @' + users[0]
        };
        gh.createIssue(options)
          .then(res => {
            if (res && res.status === 'exists') {
              console.log('Issue ' + res.issue + ' already exists');
            } else {
              // add the GitHub issue and url to Slack alert input
              message.url = res.url;
              message.issue = res.issue;
              // override message username with username from Oracle
              // if no username, then delete so goes to channel
              if (users[0] === 'mapbox/security-team') {
                delete message.username;
              } else {
                message.username = users[0];
              }
              slack.alertToSlack(message, client, slackChannel, (err, status) => {
                if (err) return callback(err);
                return callback(null, status);
              });
            }
          })
          .catch(err => { callback(err, 'error handled'); });
      } else if (msgType === 'broadcast') {
        let options = {
          owner: githubOwner,
          repo: githubRepo,
          token: githubToken,
          title: message.body.github.title,
          body: message.body.github.body + '\n\n @' + users[0]
        };
        let q = queue(1);
        if (message.users[0] === 'mapbox/security-team') {
          return callback('Error: broadcast message without users list');
        }
        gh.createIssue(options)
          .then(res => {
            if (res && res.status === 'exists') {
              console.log('Issue ' + res.issue + ' already exists');
            } else {
              // add the GitHub issue and url
              message.url = res.url;
              message.issue = res.issue;
              // users is an array of people
              users.forEach((user) => {
                message.username = user;
                q.defer(slack.alertToSlack, message, client, slackChannel);
              });
            }
            q.awaitAll(function(err, status) {
              if (err) return callback(err);
              return callback();
            });
          });
      } else {
        // create PD incident
        let options = {
          accessToken: pagerDutyApiKey,
          title: message.body.pagerduty.title,
          serviceId: pagerDutyServiceId,
          incidentKey: message.body.pagerduty.title,
          from: pagerDutyFromAddress
        };
        if (message.body.pagerduty.body) {
          options.body = message.body.pagerduty.body;
        }
        let incident = pd(options);
        incident
          .then(value => { callback(null, 'pagerduty incident triggered'); })
          .catch(error => { callback(error, 'error handled'); });
      }
    };
  });
};
