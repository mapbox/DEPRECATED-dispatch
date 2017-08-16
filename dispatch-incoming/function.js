'use strict';

const decrypt = require('../lib/utils.js').decrypt;
const d3 = require('d3-queue');
const request = require('request');

module.exports.fn = function(event, context, callback) {
  // decrypt the environment
  decrypt(process.env, function(err, res) {
    if (err) throw err;

    const PDApiKey = process.env.PagerDutyApiKey;
    const PDServiceId = process.env.PagerDutyServiceId;
    const PDFromAddress = process.env.PagerDutyFromAddress;
    const GithubRepo = process.env.GithubRepo;
    const GithubOwner = process.env.GithubOwner;
    const GithubToken = process.env.GithubToken;
    const SlackBotToken = process.env.SlackBotToken;
    const SlackChannel = process.env.SlackChannel;
    const OracleUrl = process.env.OracleUrl;
    const OracleSecret = process.env.OracleSecret;
    let users;

    if (event.Records.length > 1) {
      return callback('SNS message contains more than one record', null);
    } else {
      const q = d3.queue(1);
      q.defer(oracle);
      q.defer(incoming);
      q.awaitAll(function(err, data) {
        return callback(err, data);
      });
    };

    function oracle(callback) {
      let messageUsers = JSON.parse(event.Records[0].Sns.Message).users;
      if (messageUsers.length > 1) {
        users = messageUsers;
        console.log('Users array contains more than one user, skipping Oracle');
        return callback();
      } else if (process.env.NODE_ENV === 'test') {
        users = [ 'testUser' ];
        return callback();
      } else {
        if (OracleUrl) {
          let OracleCall = {
            url: OracleUrl,
            qs: { query: messageUsers[0] }
          };
          if (OracleSecret) {
            OracleCall.headers = {
              'x-api-key': OracleSecret
            };
          }
          console.log('querying Oracle for: ' + messageUsers[0]);
          request.get(OracleCall, function(err, response, body) {
            if (err) return callback(err);
            if (body && body.github === 'mapbox/security-team') {
              console.log('Oracle query returned no results for: ' + messageUserName);
              users = [ body.github ];
              return callback();
            }
            console.log('Oracle replied: ' + body.username);
            users = [ body.username ];
            return callback();
          });
        } else {
          users = messageUsers;
        }
        return callback();
      }
    };

    function incoming(callback) {
      const slack = require('../lib/slack.js');
      const webClient = require('@slack/client').WebClient;
      const client = new webClient(SlackBotToken);
      const gh = require('../lib/github.js');

      let message = JSON.parse(event.Records[0].Sns.Message);
      let priority = message.priority;
      let title = message.title;
      let body = message.body;

      if (!priority) {
        return callback(null, 'unhandled response, no priority found in message');
      } else if (priority === 'self-service') {
        // create GH issue
        const options = {
          owner: GithubOwner,
          repo: GithubRepo,
          token: GithubToken,
          user: users[0],
          title: title,
          body: body + '/n/n @' + users[0]
        };
        gh.createIssue(options)
          .then(res => {
            // alert to Slack
            if (res && res.status === 'exists') {
              console.log('Issue ' + res.issue + ' already exists');
            } else {
              message.issue = res.issue;
              // override message username with username from Oracle
              // if no username, then delete so goes to channel
              if (users[0] === 'mapbox/security-team') {
                delete message.username;
              } else {
                message.username = users[0];
              }
              slack.alertToSlack(message, client, SlackChannel, (err, status) => {
                if (err) return callback(err);
                return callback(null, status);
              });
            }
          })
          .catch(err => { callback(err, 'error handled'); });
      } else if (priority === 'broadcast') {
        const options = {
          owner: GithubOwner,
          repo: GithubRepo,
          token: GithubToken,
          title: title,
          body: body
        };
        var q = queue(1);
        if (users[0] === 'mapbox/security-team') {
          return callback('Broadcast message without users list');
        }
        gh.createIssue(options)
          .then(res => {
            // alert to Slack
            if (res && res.status === 'exists') {
              console.log('Issue ' + res.issue + ' already exists');
            } else {
              message.issue = res.issue;
              // users is an array of people
              users.forEach((user) => {
                message.username = user;
                q.defer(slack.alertToSlack, message, client, SlackChannel);
              });
            }
            q.awaitAll(function(err,data) {
              if (err) return callback(err);
              return callback();
            });
          });
      } else {
        // create PD incident
        const pd = require('../lib/pagerduty.js').createIncident;
        const options = {
          accessToken: PDApiKey,
          title: title, // TODO get the title from webhook event
          serviceId: PDServiceId,
          incidentKey: 'testing', // TODO get the incident key from webhook event
          from: PDFromAddress
        };
        var incident = pd(options);
        incident
          .then(value => { callback(null, 'pagerduty incident triggered'); })
          .catch(error => { callback(error, 'error handled'); });
      }
    };
  });
};
