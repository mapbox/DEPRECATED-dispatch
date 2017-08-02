var dke = require('decrypt-kms-env');

module.exports.fn = function(event, context, callback) {
  // decrypt the environment
  dke(process.env, function(err, scrubbed) {
    if (err) throw err;
    const PDApiKey = process.env.PagerDutyApiKey;
    const PDServiceId = process.env.PagerDutyServiceId;
    const PDFromAddress = process.env.PagerDutyFromAddress;
    const GithubToken = process.env.GithubToken;
    const GithubOwner = process.env.GithubOwner;
    const GithubRepo = process.env.GithubRepo;

    if (event.response == 'ok') {
      var github = require('../lib/github.js');
      var closeIssue = github.closeIssue({
        token: GithubToken,
        githubIssueNumber: event.githubIssueNumber, // TODO get the number from slack payload
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
    else if (event.response == 'not ok') {
      var pd = require('../lib/pagerduty.js');
      var options = {
        accessToken: PDApiKey,
        title: 'the server is on fire', // TODO get the title from slack payload
        serviceId: PDServiceId,
        incidentKey: 'testing', // TODO get the incident key from slack payload
        from: PDFromAddress
      };
      var incident = pd(options);
      incident
        .then(value => { callback(null, 'incident triggered'); })
        .catch(error => { callback(error, 'error handled'); });
    } else {
      callback(null, 'unhandled response');
    }
  });
};
