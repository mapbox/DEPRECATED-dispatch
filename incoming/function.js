'use strict';

const decrypt = require('../lib/utils.js').decrypt;
const gh = require('../lib/github.js');
const pd = require('../lib/pagerduty.js').createIncident;
const queue = require('d3-queue').queue;
const request = require('request');
const slack = require('../lib/slack.js');
const webClient = require('@slack/client').WebClient;

module.exports.fn = function(event, context, callback) {

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

    if (event.Records === undefined || !Array.isArray(event.Records)) {
      return callback('SNS message malformed');
    } else if (event.Records.length > 1) {
      return callback('SNS message contains more than one record', null);
    } else {
      let message = JSON.parse(event.Records[0].Sns.Message);
      let msgType = message.type;
      const client = new webClient(slackBotToken);

      if (!msgType) {
        return callback(null, 'unhandled response, no priority found in message');
      } else if (msgType === 'self-service') {
        let user = checkUser(message.users[0]);
        let options = {
          owner: githubOwner,
          repo: githubRepo,
          token: githubToken,
          title: message.body.github.title,
          body: message.body.github.body + '\n\n @' + user.github
        };
        gh.createIssue(options)
          .then(res => {
            if (res && res.status === 'exists') {
              console.log('Issue ' + res.issue + ' already exists');
            } else {
              // add the GitHub issue number and url to Slack alert object
              message.url = res.url;
              message.number = res.number;
              slack.alertToSlack(message, user.slack, client, (err, status) => {
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
          body: message.body.github.body
        };
        gh.createIssue(options)
          .then(res => {
            if (res && res.status === 'exists') {
              return callback('ERR: Issue ' + res.issue + ' already exists');
            } else {
              // add the GitHub issue number and url to Slack alert object
              message.url = res.url;
              message.number = res.number;
              // alert to slack
              let q = queue(1);
              message.users.forEach((user) => {
                user = checkUser(user);
                q.defer(slack.alertToSlack, message, user.slack, client);
              });
              q.awaitAll(function(err, status) {
                if (err) return callback(err);
                return callback(null, status);
              });
            }
          });
      } else {
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
    }

    function checkUser(user) {
      if (!user.github) {
        // cc security team if github user missing
        user.github = 'mapbox/security-team';
      }
      if (!user.slack) {
        // use backup channel when slack user missing
        user.slack = `#${slackChannel}`;
      } else {
        if (!(user.slack.indexOf('@') > -1)) user.slack = `@${user.slack}`;
      }
      return user;
    }

  });
};
