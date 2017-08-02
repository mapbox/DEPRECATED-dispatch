var message = require('lambda-cfn').message;
var dke = require('decrypt-kms-env');
var splitOnComma = require('lambda-cfn').splitOnComma;
var getEnv = require('lambda-cfn').getEnv;

module.exports.config = {
  name: 'dispatchTriage',
  runtime: 'nodejs4.3',
  sourcePath: 'rules/dispatch-triage.js',
  parameters: {
    PagerDutyApiKey: {
      Type: 'String',
      Description: '[secure] PagerDuty API key'
    },
    PagerDutyServiceId: {
      Type: 'String',
      Description: 'PagerDuty service Id'
    },
    PagerDutyFromAddress: {
      Type: 'String',
      Description: 'PagerDuty From address'
    },
    GithubToken: {
      Type: 'String',
      Description: '[secure] GitHub OAuth Token'
    },
    GithubOwner: {
      Type: 'String',
      Description: 'Owner of Github repo'
    },
    GithubRepo: {
      Type: 'String',
      Description: 'Github repository'
    }
  },
  statements: [
    {
      Effect: 'Allow',
      Action: [
        'kms:Decrypt'
      ],
      Resource: {
        "Fn::ImportValue":"cloudformation-kms-production"
      }
    }
  ],
  gatewayRule: {
    method: 'POST',
    apiKey: false
  }
};

module.exports.fn = function(event, context, callback) {
  // decrypt the environment
  dke(process.env, function(err, scrubbed) {
    if (err) throw err;
    const PDApiKey = process.env.dispatchTriagePagerDutyApiKey;
    const PDServiceId = process.env.dispatchTriagePagerDutyServiceId;
    const PDFromAddress = process.env.dispatchTriagePagerDutyFromAddress;
    const GithubToken = process.env.dispatchTriageGithubToken;
    const GithubOwner = process.env.dispatchTriageGithubOwner;
    const GithubRepo = process.env.dispatchTriageGithubRepo;

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
