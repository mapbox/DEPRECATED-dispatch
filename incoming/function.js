'use strict';

const decrypt = require('../lib/utils.js').decrypt;
const gh = require('../lib/github.js');
const pd = require('../lib/pagerduty.js').createIncident;
const queue = require('d3-queue').queue;
const slack = require('../lib/slack.js');
const WebClient = require('@slack/client').WebClient;
const crypto = require('crypto');

module.exports.fn = function(event, context, callback) {
  decrypt(process.env, function(err) {
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
      const client = new WebClient(slackBotToken);
      const requestId = message.requestId ? message.requestId : crypto.randomBytes(6).toString('hex');
      if (!message.retrigger) { message.retrigger = true; }

      if (!msgType) {
        return callback(null, 'unhandled response, no priority found in message');
      } else if (msgType === 'self-service') {
        let user = checkUser(message.users[0]);
        let options = {
          owner: githubOwner,
          repo: githubRepo,
          token: githubToken,
          retrigger: message.retrigger,
          title: message.body.github.title,
          body: message.body.github.body + '\n\n @' + user.github
        };
        console.log(`${requestId} creating issue ${message.body.github.title} for ${user.github}`);
        gh.createIssue(options)
          .then(res => {
            if (res && res.status === 'exists') {
              console.log(`${requestId} issue ${res.issue} already exists`);
            } else {
              message.url = res.url;
              message.number = res.number;
              message.requestId = requestId;
              console.log(`${requestId} issue ${res.number} created for ${message.body.github.title}`);
              slack.alertToSlack(message, user.slack, client, slackChannel, (err, status) => {
                if (err) return callback(err);
                return callback(null, status);
              });
            }
          })
          .catch(err => { callback(err, `${requestId} error handled`); });
      } else if (msgType === 'broadcast') {
        let userArray = message.users.map(function(obj) { return obj.slack; });
        let options = {
          owner: githubOwner,
          repo: githubRepo,
          token: githubToken,
          retrigger: message.retrigger,
          title: message.body.github.title,
          body: message.body.github.body + '\n\n' + userArray.toString()
        };
        gh.createIssue(options)
          .then(res => {
            if (res && res.status === 'exists') {
              console.log(`${requestId} issue ${res.issue} already exists`);
            } else {
              message.url = res.url;
              message.number = res.number;
              message.requestId = requestId;
              console.log(`${requestId} issue ${res.number} created for ${message.body.github.title}`);
              let q = queue(1);
              message.users.forEach((user) => {
                user = checkUser(user);
                q.defer(slack.alertToSlack, message, user.slack, client, slackChannel);
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
          .then(value => { callback(null, `${requestId} pagerduty incident triggered`); }) // eslint-disable-line no-unused-vars
          .catch(error => { callback(error, `${requestId} error handled`); });
      }
    };

    function checkUser(user) {
      if (!user.github) {
        user.github = 'mapbox/security-team';
      }
      if (!user.slack) {
        user.slack = `#${slackChannel}`;
      } else {
        if (!(user.slack.indexOf('@') > -1)) user.slack = `@${user.slack}`;
      }
      return user;
    };
  });
};
