'use strict';

const decrypt = require('../lib/utils.js').decrypt;

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
    if (event.Records.length > 1) callback('SNS contains more than one record.', null);
    else {
      let message = JSON.parse(event.Records[0].Sns.Message);
      let priority = message.priority;
      let title = message.title;
      let body = message.body;
      // route alarms based on priority
      if (priority == 'self-service') {
        // create GH issue
        const gh = require('../lib/github.js');
        const options = {
          owner: GithubOwner,
          repo: GithubRepo,
          token: GithubToken,
          user: 'k-mahoney',
          title: title,
          body: 'test message body'
        };
        gh.createIssue(options)
        .then(res => {
          message.githubIssue = res.githubIssue;
          // alert to Slack
          const slack = require('../lib/slack.js');
          const webClient = require('@slack/client').WebClient;
          const client = new webClient(SlackBotToken);
          slack.alertToSlack(message, client, SlackChannel, (err, status) => {
            if (err) callback(err);
            callback(null, status);
          });
        })
        .catch(err => { callback(err, 'error handled'); });
      }
      else if (priority != 'self-service') {
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
      else callback(null, 'unhandled response');
    };
  });
};