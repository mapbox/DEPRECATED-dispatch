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

    const lambdaFailure = 'Lambda failure';

    triage.checkEvent(event, slackVerificationToken, (err, payload) => {
      if (err) {
        console.log({
          severity: 'error',
          requestId: null,
          service: 'lambda',
          message: err
        });
        return callback(lambdaFailure);
      }

      // validate callback decode for minimum info
      utils.decode(payload.callback_id, (err, res) => {
        if (err) {
          console.log({
            severity: 'error',
            requestId: null,
            service: 'lambda',
            message: err
          });
          return callback(lambdaFailure);
        }
        // check for GitHub issue for continued Slack functionality
        if (!res.github) {
          console.log({
            severity: 'error',
            requestId: res.requestId,
            service: 'lambda',
            message: 'input missing GitHub issue for Slack callback_id'
          });
          return callback(lambdaFailure);
        }

        const response = payload.actions[0].name;

        let responseText = payload.actions[0].value;
        let responseObject;
        let responseError;

        // RESPONSE YES
        if (response === 'yes') {
          let options = {
            token: gitHubToken,
            number: res.github,
            owner: gitHubOwner,
            repo: gitHubRepo
          };

          let attachment = {
            attachment_type: 'default',
            fallback: `Could not load Slack response, ${res.requestId}: closed GitHub issue ${gitHubRepo}/${res.github}`,
            text: responseText,
            color: '#008E00',
            footer: 'Dispatch alert acknowledged',
            ts: Math.floor((new Date).getTime()/1000),
            replace_original: false
          };

          github.closeIssue(options, gitHubToken)
            .then(value => { // eslint-disable-line no-unused-vars
              // log success, return responseObject to Slack via callback
              console.log({
                severity: 'info',
                requestId: res.requestId,
                service: 'github',
                message: `GitHub issue ${gitHubRepo}/${res.github} was successfully closed`
              });

              responseObject = { attachments: [ attachment ] };

              return callback(null, responseObject);
            })
            .catch(error => {
              // log error, return responseError to Slack via callback
              console.log({
                severity: 'error',
                requestId: res.requestId,
                service: 'github',
                message: `failed to close GitHub issue ${gitHubRepo}/${res.github}, ${error}`
              });

              responseError = `Error: dispatch ${res.requestId} failed to close GitHub issue ${gitHubRepo}/${res.github}, ${error}`;

              return callback(null, responseError);
            });
        }

        // RESPONSE NO
        else if (response === 'no') {
          const pagerDutyTitle = `dispatch ${res.requestId}: user ${payload.user.name} responded '${response}' for self-service issue ${gitHubRepo}/${res.github}`;
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
            .then(value => {
              // log success, return responseObject to Slack via callback
              console.log({
                severity: 'info',
                requestId: res.requestId,
                service: 'pagerduty',
                message: `created PagerDuty incident ${value.body.incident.incident_key} successfully`
              });

              responseObject = { attachments: [ attachment ] };

              return callback(null, responseObject);
            })
            .catch(error => {
              // check for existing PagerDuty incident
              if (error.errorMessage && /matching dedup key already exists/.test(error.errorMessage)) {
                console.log({
                  severity: 'notice',
                  requestId: res.requestId,
                  service: 'pagerduty',
                  message: `found existing PagerDuty incident, will not create duplicate: ${JSON.stringify(error)}`
                });

                responseError = responseText ? responseText : `dispatch ${res.requestId} - found existing PagerDuty incident ${value.incident.incident_key}, will not create duplicate`;
              } else {
                console.log({
                  severity: 'error',
                  requestId: res.requestId,
                  service: 'pagerduty',
                  message: 'failed to create PagerDuty incident: ${JSON.stringify(error)}'
                });

                responseError = `Error: dispatch ${res.requestId} failed to create PagerDuty incident`;
              }

              return callback(null, responseError);
            });
        }

        else {
          console.log({
            severity: 'error',
            requestId: res.requestId,
            service: 'lambda',
            message: 'unhandled payload response'
          });

          return callback(`Error: dispatch ${res.requestId} unhandled payload response`);
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

    if (payload.token !== slackVerificationToken) return callback('incorrect Slack verification token');
    if (payload.actions.length > 1) return callback(`found ${payload.actions.length} actions in payload, expected 1`);

    return callback(null, payload);
  } catch (err) {
    return callback('failed to parse dispatch triage event payload');
  }
};

module.exports = triage;
