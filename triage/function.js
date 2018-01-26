'use strict';

const querystring = require('querystring');
const github = require('../lib/github.js');
const pagerduty = require('../lib/pagerduty.js');
const utils = require('../lib/utils.js');

const triage = {};

/**
 * Lambda function body, triggered by SNS event
 *
 * @param {object} event - SNS event object, contains message
 * @param {object} context - object containing lambda function runtime information
 * @param {function} callback - function called when lambda run is complete
 */
triage.fn = function(event, context, callback) {
  utils.decrypt(process.env, (err) => {
    if (err) throw err;

    const gitHubOwner = process.env.GitHubOwner;
    const gitHubRepo = process.env.GitHubRepo;
    const gitHubToken = process.env.GitHubToken;
    const pagerDutyApiKey = process.env.PagerDutyApiKey;
    const pagerDutyFromAddress = process.env.PagerDutyFromAddress;
    const pagerDutyServiceId = process.env.PagerDutyServiceId;
    const slackVerificationToken = process.env.SlackVerificationToken;

    triage.checkEvent(event, slackVerificationToken, (err, payload) => {
      if (err) return callback(err);

      // validate callback decode for minimum info
      utils.decode(payload.callback_id, (err, res) => {
        if (err) return callback(err);
        if (!res.github) return callback(`Error - dispatch ${res.requestId} Slack callback_id missing GitHub issue`);

        const response = payload.actions[0].name;

        let responseText = payload.actions[0].value;
        let responseObject;
        let responseError;

        if (response === 'yes') {
          let options = {
            token: gitHubToken,
            number: res.github,
            owner: gitHubOwner,
            repo: gitHubRepo
          };

          let attachment = {
            attachment_type: 'default',
            fallback: `Could not load Slack response, ${res.requestId}: closed GitHub issue ${res.github}`,
            text: responseText,
            color: '#008E00',
            footer: 'Dispatch alert acknowledged',
            ts: Math.floor((new Date).getTime()/1000),
            replace_original: false
          };

          github.closeIssue(options, gitHubToken)
            .then(value => { // eslint-disable-line no-unused-vars
              // log success, return responseObject to Slack via callback
              console.log(`dispatch ${res.requestId} - closed GitHub issue ${res.github}`);
              responseObject = { attachments: [ attachment ] };
              return callback(null, responseObject);
            })
            .catch(error => {
              // log error, return responseError to Slack via callback
              responseError = `Error - dispatch ${res.requestId} failed to close GitHub issue ${res.github}, ${error}`;
              console.log(responseError);
              return callback(null, responseError);
            });
        }

        else if (response === 'no') {
          const pagerDutyTitle = `dispatch ${res.requestId}: user ${payload.user.name} responded '${response}' for self-service issue ${res.github}`;
          const pagerDutyBody = `${pagerDutyTitle}\n\n https://github.com/${gitHubOwner}/${gitHubRepo}/issues/${res.github}`;

          let options = {
            accessToken: pagerDutyApiKey,
            title: pagerDutyTitle,
            serviceId: (res.pagerDutyServiceId ? res.pagerDutyServiceId : pagerDutyServiceId),
            incidentKey: res.requestId,
            from: pagerDutyFromAddress,
            body: pagerDutyBody
          };

          let attachment = {
            attachment_type: 'default',
            fallback: `Could not load Slack response, ${res.requestId}: Created PagerDuty incident successfully`,
            text: responseText,
            color: '#CC0000',
            footer: 'Dispatch alert escalated',
            ts: Math.floor((new Date).getTime()/1000),
            replace_original: false
          };

          const incident = pagerduty.createIncident(options);

          incident
            .then(value => { // eslint-disable-line no-unused-vars
              // log success, return responseObject to Slack via callback
              console.log(`dispatch ${res.requestId} - created PagerDuty incident successfully`);
              responseObject = { attachments: [ attachment ] };
              return callback(null, responseObject);
            })
            .catch(error => {
              // check for existing PagerDuty incident
              if (error.errorMessage && /matching dedup key already exists/.test(error.errorMessage)) {
                responseError = responseText ? responseText : `dispatch ${res.requestId} - found existing PagerDuty incident, will not create duplicate`;
              } else {
                responseError = `Error - dispatch ${res.requestId} failed to create PagerDuty incident`;
              }
              // log error, return responseError to Slack via callback
              console.log(responseError);
              return callback(null, responseError);
            });
        }

        else {
          return callback(`Error - dispatch ${res.requestId} unhandled payload response`);
        }
      });
    });
  });
};

/**
 * Ingest and validate SNS event object
 *
 * @param {object} event - SNS event object, contains message
 * @param {string} slackVerificationToken
 * @param {function} callback
 */
triage.checkEvent = function(event, slackVerificationToken, callback) {
  try {
    let payload = JSON.parse(querystring.parse(event.postBody).payload);

    if (payload.token !== slackVerificationToken) return callback('Error - incorrect Slack verification token');
    if (payload.actions.length > 1) return callback(`Error - found ${payload.actions.length} actions in payload, expected 1`);

    return callback(null, payload);
  } catch (err) {
    return callback('Error - parsing dispatch triage event payload');
  }
};

module.exports = triage;