'use strict';

const qs = require('querystring');
const decrypt = require('../lib/utils').decrypt;
const decode = require('../lib/utils').decode;

module.exports.fn = function(event, context, callback) {

  decrypt(process.env, function(err) {
    if (err) throw err;

    let payload;

    try {
      payload = JSON.parse(qs.parse(event.postBody).payload);
    } catch (err) {
      return callback(`error: payload parsing ${event.postBody}`);
    }

    if (payload.token !== process.env.SlackVerificationToken) {
      return callback('error: incorrect Slack verification token');
    }

    // assume there was just one action
    // TODO proper format/error handling
    if (payload.actions.length > 1) {
      console.log(`Found ${payload.actions.length} actions in payload`);
      console.log(`Payload actions: ${JSON.stringify(payload.actions)}`);
    }

    // validate callback decode for minimum info
    decode(payload.callback_id, (err, res) => {
      if (err) return callback(err);
      if (!res.github) {
        return callback(`${res.requestId}: Slack callback_id missing github issue`);
      }

      const pagerDutyApiKey = process.env.PagerDutyApiKey;
      const pagerDutyServiceId = process.env.PagerDutyServiceId;
      const pagerDutyFromAddress = process.env.PagerDutyFromAddress;
      const githubToken = process.env.GithubToken;
      const githubOwner = process.env.GithubOwner;
      const githubRepo = process.env.GithubRepo;
      const response = payload.actions[0].name;
      let responseText = payload.actions[0].value;
      let responseObject;

      if (response === 'yes') {
        const github = require('../lib/github.js');
        const closeIssue = github.closeIssue({
          token: githubToken,
          number: res.github,
          owner: githubOwner,
          repo: githubRepo
        });

        closeIssue
          .then(value => { // eslint-disable-line no-unused-vars
            console.log(`${res.requestId}: closed GitHub issue ${res.github}`);
            // this callback text is displayed to the slack user
            responseObject = {
              attachments: [
                {
                  'attachment_type': 'default',
                  fallback: `Could not load Slack response, ${res.requestId}: closed GitHub issue ${res.github}`,
                  text: responseText,
                  color: '#008E00',
                  footer: 'Dispatch alert acknowledged',
                  ts: Math.floor((new Date).getTime()/1000),
                  'replace_original': false
                }
              ]
            };
            return callback(null, responseObject);
          })
          .catch(error => {
            return callback(null, `${res.requestId}: error: failed to close GitHub issue ${res.github}, ${error}`);
          });

      } else if (response === 'no') {

        const createIncident = require('../lib/pagerduty.js').createIncident;
        const pagerDutyTitle = `${res.requestId}: user ${payload.user.name} responded '${response}' for self-service issue ${res.github}`;
        const pagerDutyBody = `${pagerDutyTitle}\n\n https://github.com/${githubOwner}/${githubRepo}/issues/${res.github}`;
        const options = {
          accessToken: pagerDutyApiKey,
          title: pagerDutyTitle,
          serviceId: (res.pagerDutyServiceId ? res.pagerDutyServiceId : pagerDutyServiceId),
          incidentKey: res.requestId,
          from: pagerDutyFromAddress,
          body: pagerDutyBody
        };
        const incident = createIncident(options);

        incident
          .then(value => { // eslint-disable-line no-unused-vars
            console.log(`${res.requestId}: Created PagerDuty incident successfully`);
            responseObject = {
              attachments: [
                {
                  'attachment_type': 'default',
                  fallback: `Could not load Slack response, ${res.requestId}: Created PagerDuty incident successfully`,
                  text: responseText,
                  color: '#CC0000',
                  footer: 'Dispatch alert escalated',
                  ts: Math.floor((new Date).getTime()/1000),
                  'replace_original': false
                }
              ]
            };
            return callback(null, responseObject);
          })
          .catch(error => {
            if (error.errorMessage && /matching dedup key already exists/.test(error.errorMessage)) {
              return callback(null, responseText ? responseText : `${res.requestId}: found matching PagerDuty incident, skipping`);
            }
            return callback(`${res.requestId}: error: failed to create PagerDuty incident, ${error}`);
          });
      } else {
        return callback(`${res.requestId}: error: unhandled payload response`);
      }
    });

  });

};