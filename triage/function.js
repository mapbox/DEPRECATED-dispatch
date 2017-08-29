var qs = require('querystring');
var decrypt = require('../lib/utils').decrypt;
var decode = require('../lib/utils').decode;

module.exports.fn = function(event, context, callback) {

  try {
    var payload = JSON.parse(qs.parse(event.postBody).payload);
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
    if (!res.github) {
      console.log(`${res.requestId}: Slack callback_id missing github issue`);
      return callback(`${res.requestId}: Slack callback_id missing github issue`);
    }
    console.log('%s: callback_id decoded: issue %s', res.requestId, res.github);

    // decrypt the environment
    decrypt(process.env, function(err, scrubbed) {
      if (err) {
        console.log('%s: decrypt error: %s', res.requestId, err);
        return callback('error: ' + err);
      }

      const pagerDutyApiKey = process.env.PagerDutyApiKey;
      const pagerDutyServiceId = process.env.PagerDutyServiceId;
      const pagerDutyFromAddress = process.env.PagerDutyFromAddress;
      const githubToken = process.env.GithubToken;
      const githubOwner = process.env.GithubOwner;
      const githubRepo = process.env.GithubRepo;
      var response = payload.actions[0].name;

      console.log('%s: found payload response: %s', res.requestId, response);
      if (response == 'yes') {
        console.log('%s: closing GitHub issue %s', res.requestId, res.github);
        var github = require('../lib/github.js');
        var closeIssue = github.closeIssue({
          token: githubToken,
          number: res.github,
          owner: githubOwner,
          repo: githubRepo
        });

        closeIssue
          .then(value => {
            console.log(`${res.requestId}: closed GitHub issue ${res.github}`);
            // this callback text is displayed to the slack user
            return callback(null,`${res.requestId}: closed GitHub issue ${res.github}`);
          })
          .catch(error => {
            console.log(`${res.requestId}: error: failed to close GitHub issue ${res.github}, ${error}`);
            return callback(null, `${res.requestId}: error: failed to close GitHub issue ${res.github}, ${error}`); // TODO fix this error handling.  When error is passed as first arg, there's an error
          });
      } else if (response == 'no') {
        var createIncident = require('../lib/pagerduty.js').createIncident;
        var options = {
          accessToken: pagerDutyApiKey,
          title: payload.original_message.text,
          serviceId: (res.pagerDutyServiceId ? res.pagerDutyServiceId : pagerDutyServiceId),
          incidentKey: res.requestId,
          from: pagerDutyFromAddress
        };
        console.log(`${res.requestId}: creating PagerDuty incident`);
        var incident = createIncident(options);
        incident
          .then(value => {
            console.log(`${res.requestId}: Created PagerDuty incident successfully`);
            return callback(null, `${res.requestId}: Created PagerDuty incident successfully`);
          })
          .catch(error => {
            if (error.errorMessage && /matching dedup key already exists/.test(error.errorMessage)) {
              console.log(`${res.requestId}: found matching PagerDuty incident, skipping`);
              return callback(null, `${res.requestId}: found matching PagerDuty incident, skipping`);
            }
            console.log(`${res.requestId}: error: failed to create PagerDuty incident, ${error}`);
            return callback(`${res.requestId}: error: failed to create PagerDuty incident, ${error}`);
          });
      } else {
        console.log(`${res.requestId}: error: unhandled payload response`);
        return callback(`${res.requestId}: error: unhandled payload response`);
      }
    });
  });
};
