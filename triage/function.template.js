var lambdaCfn = require('@mapbox/lambda-cfn');
var cf = require('@mapbox/cloudfriend');

module.exports = lambdaCfn.build({
  name: 'dispatchTriage',
  memorySize: '1536',
  parameters: {
    PagerDutyApiKey: {
      Type: 'String',
      Description: '[secure] PagerDuty API key'
    },
    PagerDutyServiceId: {
      Type: 'String',
      Description: 'PagerDuty service ID'
    },
    PagerDutyFromAddress: {
      Type: 'String',
      Description: 'PagerDuty account email address'
    },
    GithubOwner: {
      Type: 'String',
      Description: 'Owner of Github repo'
    },
    GithubRepo: {
      Type: 'String',
      Description: 'Github repository'
    },
    GithubToken: {
      Type: 'String',
      Description: '[secure] GitHub OAuth Token'
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
    }
  }
});
