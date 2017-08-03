var lambdaCfn = require('lambda-cfn');
var cf = require('@mapbox/cloudfriend');

module.exports = lambdaCfn.build({
  name: 'dispatchTriage',
  runtime: 'nodejs4.3',
  sourcePath: 'functions/dispatch-triage/function.js',
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
  eventSources: {
    webhook: {
      method: 'POST',
      apiKey: false,
      integration: {
        PassthroughBehavior: 'WHEN_NO_TEMPLATES',
        RequestTemplates: {
          'application/x-www-form-urlencoded': '{ "postBody" : $input.json("$")}'
        }
      }
    },
  }
});
