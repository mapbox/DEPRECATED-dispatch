'use strict';

const qs = require('querystring');
const decrypt = require('../lib/utils').decrypt;
const decode = require('../lib/utils').decode;

module.exports.fn = function(event, context, callback) {

  let payload;

  try {
    payload = JSON.parse(qs.parse(event.postBody).payload);
  } catch (err) {
    console.log(`error: payload parsing ${event.postBody}`);
    return callback(`error: payload parsing ${event.postBody}`);
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
      console.log(`${res.requestId}: Slack callback_id missing github issue`);
      return callback(`${res.requestId}: Slack callback_id missing github issue`);
    }
    console.log(`${res.requestId}: callback_id decoded issue ${res.github}`);

    // decrypt the environment
    decrypt(process.env, function(err) {
      if (err) {
        console.log(`${res.requestId}: decrypt error ${err}`);
        return callback('error: ' + err);
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
      let log;

      console.log(`${res.requestId}: found payload response '${response}'`);
      if (response === 'yes') {
        console.log(`${res.requestId}: closing GitHub issue ${res.github}`);
        const github = require('../lib/github.js');
        const closeIssue = github.closeIssue({
          token: githubToken,
          number: res.github,
          owner: githubOwner,
          repo: githubRepo
        });

        closeIssue
          .then(value => { // eslint-disable-line no-unused-vars
            log =`${res.requestId}: closed GitHub issue ${res.github}`;
            console.log(log);
            // this callback text is displayed to the slack user
            responseObject = {
              attachments: [
                {
                  'attachment_type': 'default',
                  fallback: `Could not load Slack response, ${log}`,
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
            log = `${res.requestId}: error: failed to close GitHub issue ${res.github}, ${error}`;
            console.log(log);
            // if get a failure to close here, return the failure to the user
            return callback(null, log);
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
        console.log(`${res.requestId}: creating PagerDuty incident`);
        const incident = createIncident(options);
        incident
          .then(value => { // eslint-disable-line no-unused-vars
            log = `${res.requestId}: Created PagerDuty incident successfully`;
            console.log(log);
            responseObject = {
              attachments: [
                {
                  'attachment_type': 'default',
                  fallback: `Could not load Slack response, ${log}`,
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
              log = `${res.requestId}: found matching PagerDuty incident, skipping`;
              console.log(log);
              return callback(null, responseText ? responseText : log);
            }
            log = `${res.requestId}: error: failed to create PagerDuty incident, ${error}`;
            console.log(log);
            return callback(log);
          });
      } else {
        log = `${res.requestId}: error: unhandled payload response`;
        console.log(log);
        return callback(log);
      }
    });
  });
};
