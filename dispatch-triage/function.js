var qs = require('querystring');
var decrypt = require('../lib/utils').decrypt;

module.exports.fn = function(event, context, callback) {
  // decrypt the environment
  decrypt(process.env, function(err, scrubbed) {
    if (err) throw err;
    const PDApiKey = process.env.PagerDutyApiKey;
    const PDServiceId = process.env.PagerDutyServiceId;
    const PDFromAddress = process.env.PagerDutyFromAddress;
    const GithubToken = process.env.GithubToken;
    const GithubOwner = process.env.GithubOwner;
    const GithubRepo = process.env.GithubRepo;
    try {
      var payload = JSON.parse(qs.parse(event.postBody).payload);
    } catch (err) {
      callback(null, 'payload parse error');
    }

    // assume there was just one action
    // TODO proper format/error handling
    var response = payload.actions[0].name;

    if (response == 'yes') {
      var github = require('../lib/github.js');
      var closeIssue = github.closeIssue({
        token: GithubToken,
        githubIssueNumber: 1, // TODO get the number from slack payload
        owner: GithubOwner,
        repo: GithubRepo
      });

      closeIssue
        .then(value => {
          callback(null, 'closed issue');
        })
        .catch(error => {
          console.log(error);
          callback(null, 'error handled'); // TODO fix this error handling.  When error is passed as first arg, there's an error
        });
    }
    // create PD incident
    else if (response == 'no') {
      var createIncident = require('../lib/pagerduty.js').createIncident;
      var options = {
        accessToken: PDApiKey,
        title: 'everything is not ok', // TODO get the title from slack payload
        serviceId: PDServiceId,
        incidentKey: 'testing', // TODO get the incident key from slack payload
        from: PDFromAddress
      };
      var incident = createIncident(options);
      incident
        .then(value => { callback(null, 'incident triggered'); })
        .catch(error => { callback(error, 'error handled'); });
    } else {
      callback(null, 'unhandled response');
    }
  });
};
