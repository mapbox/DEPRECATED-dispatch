'use strict';

const crypto = require('crypto');
const queue = require('d3-queue').queue;
const WebClient = require('@slack/client').WebClient;

const utils = require('../lib/utils.js');
const github = require('../lib/github.js');
const pagerduty = require('../lib/pagerduty.js');
const slack = require('../lib/slack.js');

const incoming = {};

/**
 * Lambda function body, triggered by SNS event
 *
 * @param {object} event - SNS event object, contains message
 * @param {object} context - object containing lambda function runtime information
 * @param {function} callback - function called when lambda run is complete
 */
incoming.lambda = function(event, context, callback) {
  utils.decrypt(process.env, (err) => {
    if (err) throw err;

    const gitHubDefaultUser = process.env.GitHubDefaultUser;
    const gitHubOwner = process.env.GitHubOwner;
    const gitHubToken = process.env.GitHubToken;
    const pagerDutyApiKey = process.env.PagerDutyApiKey;
    const pagerDutyFromAddress = process.env.PagerDutyFromAddress;
    const slackBotToken = process.env.SlackBotToken;
    const slackDefaultChannel = process.env.SlackDefaultChannel;

    incoming.checkEvent(event, (err, message) => {
      if (err) return callback(err);
      if (!message.type) return callback('Error - No valid priority found in SNS message');
      if (typeof message.retrigger === 'undefined') { message.retrigger = true; };

      const gitHubRepo = message.gitHubRepo ? message.gitHubRepo : process.env.GitHubRepo;
      const pagerDutyServiceId = message.pagerDutyServiceId ? message.pagerDutyServiceId : process.env.PagerDutyServiceId;
      const requestId = message.requestId ? message.requestId : crypto.randomBytes(6).toString('hex');

      // SELF-SERVICE
      if (message.type === 'self-service') {
        let user = incoming.checkUser(message.users[0], gitHubDefaultUser, slackDefaultChannel);

        incoming.callGitHub(user, message, requestId, gitHubOwner, gitHubRepo, gitHubToken, (err, res) => {
          if (err) return callback(err, res);

          // NOTE: If the GitHub issue already exists and message.retrigger is false, halt alert and return
          let isGithubIssueExists = res && res.status === 'exists';

          if (isGithubIssueExists) {
            return callback(null, `dispatch ${requestId} - issue ${res.issue} already exists`);
          }

          incoming.callSlack(user, message, requestId, slackDefaultChannel, slackBotToken, res, (err, status) => {
            if (err) return callback(err, status);
            return callback(null, status);
          });
        });
      }

      // BROADCAST
      else if (message.type === 'broadcast') {
        incoming.callGitHub(gitHubDefaultUser, message, requestId, gitHubOwner, gitHubRepo, gitHubToken, (err, res) => {
          if (err) return callback(err, res);

          let q = queue(1);
          message.users.forEach((user) => {
            user = incoming.checkUser(user, gitHubDefaultUser, slackDefaultChannel);
            q.defer(incoming.callSlack, user, message, requestId, slackBotToken, slackDefaultChannel, res);
          });

          q.awaitAll(function(err, status) {
            if (err) return callback(err, `dispatch ${requestId} - error handled`);
            return callback(null, status);
          });
        });
      }

      // HIGH-PRIORITY
      else if (message.type === 'high-priority'){
        incoming.callPagerDuty(message, requestId, pagerDutyApiKey, pagerDutyServiceId, pagerDutyFromAddress, (err, status) => {
          if (err) return callback(err, status);
          return callback(null, status);
        });
      }

      else {
        incoming.callPagerDuty(message, requestId, pagerDutyApiKey, pagerDutyServiceId, pagerDutyFromAddress, (err, status) => {
          if (err) return callback(err, status);
          return callback(null, `dispatch ${requestId} - no recongnized message priority, defaulted to PagerDuty alert`);
        });
      }
    });
  });
};

/**
 * Ingest and validate SNS event object
 *
 * @param {object} event - SNS event object, contains message
 * @param {function} callback
 */
incoming.checkEvent = function(event, callback) {
  if (event.Records === undefined || !Array.isArray(event.Records)) return callback('Error - SNS message malformed');
  if (event.Records.length > 1) return callback('Error - SNS message contains more than one record');
  else {
    let message;
    try {
      message = JSON.parse(event.Records[0].Sns.Message);
    } catch (err) {
      return callback('Error - SNS message contains invalid JSON');
    }
    return callback(null, message);
  }
};

/**
 * Validate user object, substitute in default values if necessary
 *
 * @param {object} user - user object, contains usernames
 * @param {string} gitHubDefaultUser - default GitHub user or team, substitute if user.github missing
 * @param {string} slackDefaultChannel - default Slack channel, substitute if user.slack is missing
 */
incoming.checkUser = function(user, gitHubDefaultUser, slackDefaultChannel) {
  if (user.slack && !(user.slack.indexOf('@') > -1)) {
    // user has Slack ID
    user.slack = `@${user.slack}`;
  }
  if (!user.slack) {
    // missing Slack ID, fallback to default channel
    user.slack = `#${slackDefaultChannel}`;
  }
  if (!user.github) {
    // missing GitHub handle, fallback to default user/team
    user.github = gitHubDefaultUser;
  }

  return user;
};

/**
 * Trigger lib/github.js functionality, create GitHub issue for dispatch alert
 *
 * @param {object} user - user object, contains usernames
 * @param {object} message - message object, contains GitHub issue title and body
 * @param {string} requestId - unique ID per dispatch alert
 * @param {string} gitHubOwner
 * @param {string} gitHubRepo
 * @param {string} gitHubToken
 * @param {function} callback
 */
incoming.callGitHub = function(user, message, requestId, gitHubOwner, gitHubRepo, gitHubToken, callback) {
  let options = {
    owner: gitHubOwner,
    repo: gitHubRepo,
    title: message.body.github.title
  };

  if (message.users.length > 1) {
    let userArray = message.users.map(function(obj) { return obj.slack; });
    options.body = `${message.body.github.body} \n\n ${userArray.toString()}`;
  } else {
    options.body = `${message.body.github.body} \n\n @${user.github}`;
  }

  github.createIssue(options, message.retrigger, gitHubToken)
    .then(res => { return callback(null, res); })
    .catch(err => { callback(err, `dispatch ${requestId} - GitHub error handled`); });
};

/**
 * Trigger lib/pagerduty.js functionality, create PagerDuty incident for dispatch alert
 *
 * @param {object} message - message object, contains PagerDuty service, title, and incident body
 * @param {string} requestId - unique ID per dispatch alert
 * @param {string} pagerDutyApiKey
 * @param {string} pagerDutyServiceId
 * @param {string} pagerDutyFromAddress
 * @param {function} callback
 */
incoming.callPagerDuty = function(message, requestId, pagerDutyApiKey, pagerDutyServiceId, pagerDutyFromAddress, callback) {
  let options = {
    accessToken: pagerDutyApiKey,
    title: message.body.pagerduty.title,
    serviceId: pagerDutyServiceId,
    incidentKey: message.body.pagerduty.title,
    from: pagerDutyFromAddress
  };

  if (message.body.pagerduty.body) options.body = message.body.pagerduty.body;

  let incident = pagerduty.createIncident(options);

  incident
    .then(value => { callback(null, `dispatch ${requestId} - PagerDuty incident triggered`); }) // eslint-disable-line no-unused-vars
    .catch(error => { callback(error, `dispatch ${requestId} - PagerDuty error handled`); });
};

/**
 * Trigger lib/slack.js functionality, send Slack message for dispatch alert
 *
 * @param {object} message - message object, contains Slack message body and interactive options
 * @param {string} requestId - unique ID per dispatch alert
 * @param {string} slackDefaultChannel - passed again as a fallback for issue with Slack username
 * @param {string} slackBotToken
 * @param {function} callback
 */
incoming.callSlack = function(user, message, requestId, slackDefaultChannel, slackBotToken, resGitHub, callback) {
  const client = new WebClient(slackBotToken);

  message.url = resGitHub.url;
  message.number = resGitHub.number;
  message.requestId = requestId;

  slack.alertToSlack(message, user.slack, client, slackDefaultChannel, (err, status) => {
    if (err) return callback(err, `dispatch ${requestId} - Slack error handled`);
    return callback(null, status);
  });
};

module.exports = incoming;