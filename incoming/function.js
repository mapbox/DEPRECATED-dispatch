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
incoming.fn = function(event, context, callback) {
  utils.decrypt(process.env, (err) => {
    if (err) throw err;

    const gitHubDefaultUser = process.env.GitHubDefaultUser;
    const gitHubOwner = process.env.GitHubOwner;
    const gitHubToken = process.env.GitHubToken;
    const pagerDutyApiKey = process.env.PagerDutyApiKey;
    const pagerDutyFromAddress = process.env.PagerDutyFromAddress;
    const slackBotToken = process.env.SlackBotToken;
    const slackDefaultChannel = process.env.SlackDefaultChannel;

    const lambdaFailure = 'Lambda failure';
    const lambdaSuccess = 'Lambda success';

    incoming.checkEvent(event, (err, message) => {
      if (err) {
        console.log({
          severity: 'error',
          requestId: null,
          service: 'lambda',
          message: err
        });
        return callback(lambdaFailure);
      }

      if (!message.type) {
        console.log({
          severity: 'error',
          requestId: null,
          service: 'lambda',
          message: 'SNS message missing priority'
        });
        return callback(lambdaFailure);
      }

      if (typeof message.retrigger === 'undefined') { message.retrigger = true; };

      const gitHubRepo = message.gitHubRepo ? message.gitHubRepo : process.env.GitHubRepo;
      const pagerDutyServiceId = message.pagerDutyServiceId ? message.pagerDutyServiceId : process.env.PagerDutyServiceId;
      const requestId = message.requestId ? message.requestId : crypto.randomBytes(6).toString('hex');

      // SELF-SERVICE
      if (message.type === 'self-service') {
        let user = incoming.checkUser(message.users[0], gitHubDefaultUser, slackDefaultChannel, requestId, message);

        incoming.callGitHub(user, message, requestId, gitHubOwner, gitHubRepo, gitHubToken, (err, res) => {
          if (err) {
            console.log({
              severity: 'error',
              requestId: requestId,
              service: 'github',
              message: err
            });
            return callback(lambdaFailure);
          }

          // NOTE: If the GitHub issue already exists and message.retrigger is false, halt alert and return
          let isGithubIssueExists = res && res.status === 'exists';

          if (isGithubIssueExists) {
            console.log({
              severity: 'notice',
              requestId: requestId,
              service: 'github',
              message: `issue ${res.issue} already exists`
            });
            return callback(null, lambdaSuccess);
          }

          incoming.callSlack(user, message, requestId, slackDefaultChannel, slackBotToken, res, (err, status) => {
            if (err) {
              console.log({
                severity: 'error',
                requestId: requestId,
                service: 'slack',
                message: err
              });
              return callback(lambdaFailure);
            }
            console.log({
              severity: 'info',
              requestId: requestId,
              service: 'lambda',
              message: `self-service routing success - opened GitHub issue ${status.url}`
            });
            return callback(null, lambdaSuccess);
          });
        });
      }

      // BROADCAST
      else if (message.type === 'broadcast') {
        incoming.callGitHub(gitHubDefaultUser, message, requestId, gitHubOwner, gitHubRepo, gitHubToken, (err, res) => {
          if (err) {
            console.log({
              severity: 'error',
              requestId: requestId,
              service: 'github',
              message: err
            });
            return callback(lambdaFailure);
          }

          // NOTE: If the GitHub issue already exists and message.retrigger is false, halt alert and return
          let isGithubIssueExists = res && res.status === 'exists';

          if (isGithubIssueExists) {
            console.log({
              severity: 'notice',
              requestId: requestId,
              service: 'github',
              message: `issue ${res.issue} already exists`
            });
            return callback(null, lambdaSuccess);
          }

          let q = queue(1);
          message.users.forEach((user) => {
            user = incoming.checkUser(user, gitHubDefaultUser, slackDefaultChannel, requestId, message);
            q.defer(incoming.callSlack, user, message, requestId, slackDefaultChannel, slackBotToken, res);
          });

          q.awaitAll(function(err, status) {
            if (err) {
              console.log({
                severity: 'error',
                requestId: requestId,
                service: 'slack',
                message: err,
                status: status
              });
              return callback(lambdaFailure);
            }

            console.log({
              severity: 'info',
              requestId: requestId,
              service: 'lambda',
              message: 'broadcast routing success - opened GitHub issue'
            });
            return callback(null, lambdaSuccess);
          });
        });
      }

      // HIGH-PRIORITY
      else if (message.type === 'high-priority') {
        incoming.callPagerDuty(message, requestId, pagerDutyApiKey, pagerDutyServiceId, pagerDutyFromAddress, (err, res) => {
          if (err) {
            console.log({
              severity: 'error',
              requestId: requestId,
              service: 'pagerduty',
              message: err
            });
            return callback(lambdaFailure);
          }
          console.log({
            severity: 'info',
            requestId: requestId,
            service: 'lambda',
            message: `high-priority routing success - ${res}`
          });
          return callback(null, lambdaSuccess);
        });
      }

      // LOW-PRIORITY
      else if (message.type === 'low-priority') {
        let user = undefined;

        if (Array.isArray(message.users)) {
          user = message.users[0];
        }

        user = incoming.checkUser(user, gitHubDefaultUser, slackDefaultChannel);

        incoming.callGitHub(user, message, requestId, gitHubOwner, gitHubRepo, gitHubToken, (err, res) => {
          if (err) {
            console.log({
              severity: 'error',
              requestId: requestId,
              service: 'github',
              message: err
            });
            return callback(lambdaFailure);
          }

          // NOTE: If the GitHub issue already exists and message.retrigger is false, halt alert and return
          let isGithubIssueExists = res && res.status === 'exists';

          if (isGithubIssueExists) {
            console.log({
              severity: 'notice',
              requestId: requestId,
              service: 'github',
              message: `issue ${res.issue} already exists`
            });
            return callback(null, lambdaSuccess);
          }

          console.log({
            severity: 'info',
            requestId: requestId,
            service: 'lambda',
            message: 'low priority routing success - opened GitHub issue'
          });
          return callback(null, lambdaSuccess);
        });
      }

      else {
        incoming.callPagerDuty(message, requestId, pagerDutyApiKey, pagerDutyServiceId, pagerDutyFromAddress, (err, res) => {
          // log that fallback was invoked
          console.log({
            severity: 'warning',
            requestId: requestId,
            service: 'lambda',
            message: 'no recognized message priority fallback to PagerDuty alert'
          });

          if (err) {
            console.log({
              severity: 'error',
              requestId: requestId,
              service: 'pagerduty',
              message: err
            });
            return callback(lambdaFailure);
          }
          console.log({
            severity: 'info',
            requestId: requestId,
            service: 'lambda',
            message: `fallback routing success - ${res}`
          });
          return callback(null, lambdaSuccess);
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
  if (event.Records === undefined || !Array.isArray(event.Records)) return callback('SNS message malformed');
  if (event.Records.length > 1) return callback('SNS message contains more than one record');
  else {
    let message;
    try {
      message = JSON.parse(event.Records[0].Sns.Message);
    } catch (err) {
      return callback('SNS message contains invalid JSON');
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
incoming.checkUser = function(user, gitHubDefaultUser, slackDefaultChannel, requestId, message) {
  if (!user) {
    console.log({
      severity: 'error',
      requestId: requestId,
      service: 'checkUser',
      message: `checkUser called with undefined user, defaulting user array. Message: ${message}`
    });
    user = {
      defaulted: true,
      slackId: slackDefaultChannel,
      github: gitHubDefaultUser
    };
    return user;
  }

  user.defaulted = false;
  if (!user.slackId) {
    // missing Slack ID, fallback to default channel
    user.slackId = slackDefaultChannel;
    // set defaulted to true
    user.defaulted = true;
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
 * @param {object} message - message object, contains GitHub issue title, body, and labels
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

  // labels can be passed in as an array of strings, and said labels will be applied to
  // the new issue. any labels that don't already exist in that repo will be created
  // https://developer.github.com/v3/issues/#create-an-issue
  if (message.body.github.labels) {
    options.labels = message.body.github.labels;
  } else if (message.body.github.label) {
    options.labels = [message.body.github.label];
  }

  // BROADCAST
  if (message.type === 'broadcast') {
    // if broadcast to >1 users, compile list of recipient Slack display_names or IDs
    let userArray = message.users.map(function(obj) {
      if (obj.slack) return obj.slack;
      else return obj.slackId;
    });
    // add recipient list wrapped in GitHub MD code tags
    options.body = `${message.body.github.body} \n\n \`\`\`\n${userArray.toString()}\n\`\`\``;
  }

  // SELF-SERVICE or LOW-PRIORITY
  if ((message.type === 'self-service') || (message.type === 'low-priority')) {
    options.body = `${message.body.github.body} \n\n @${user.github}`;
  }

  github.createIssue(options, message.retrigger, gitHubToken)
    .then(res => {
      return callback(null, res);
    }).catch(err => {
      callback(err);
    });
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
    .then(value => { callback(null, `PagerDuty incident ${value.body.incident.incident_key} created`); })
    .catch(error => { callback(error); });
};

/**
 * Trigger lib/slack.js functionality, send Slack message for dispatch alert
 *
 * @param {object} user - user object, contains Slack ID (destination)
 * @param {object} message - message object, contains Slack message body and interactive options
 * @param {string} requestId - unique ID per dispatch alert
 * @param {string} slackDefaultChannel - passed again as a fallback for issue with Slack username
 * @param {object} resGitHub - response object from callGitHub
 * @param {string} slackBotToken
 * @param {function} callback
 */
incoming.callSlack = function(user, message, requestId, slackDefaultChannel, slackBotToken, resGitHub, callback) {
  const client = new WebClient(slackBotToken);

  message.url = resGitHub.url;
  message.number = resGitHub.number;
  message.requestId = requestId;

  slack.alertToSlack(user, message, slackDefaultChannel, client, (err, status) => {
    if (err) return callback(err);
    return callback(null, status);
  });
};

module.exports = incoming;
