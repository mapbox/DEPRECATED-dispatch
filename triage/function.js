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
    if (err) return callback(err);
    if (!res.github) {
      console.log(`${res.requestId}: Slack callback_id missing github issue`);
      return callback(`${res.requestId}: Slack callback_id missing github issue`);
    }
    console.log('%s: callback_id decoded: issue %s', res.requestId, res.github);

    // decrypt the environment
    decrypt(process.env, function(err) {
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
      var responseText = payload.actions[0].value;
      var log;

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
          .then(value => { // eslint-disable-line no-unused-vars
            log =`${res.requestId}: closed GitHub issue ${res.github}`;
            console.log(log);
            // this callback text is displayed to the slack user
            return callback(null, responseText ? responseText : log);
          })
          .catch(error => {
            log = `${res.requestId}: error: failed to close GitHub issue ${res.github}, ${error}`;
            console.log(log);
            // if get a failure to close here, return the failure to the user
            return callback(null, log);
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
          .then(value => { // eslint-disable-line no-unused-vars
            log = `${res.requestId}: Created PagerDuty incident successfully`;
            console.log(log);
            return callback(null, responseText ? responseText : log);
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
