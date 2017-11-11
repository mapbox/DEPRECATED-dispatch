'use strict';

const lambdaCfn = require('@mapbox/lambda-cfn');

module.exports = lambdaCfn.build({
  name: 'triage',
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
    },
    SlackVerificationToken: {
      Type: 'String',
      Description: '[secure] Slack verification token for Dispatch Slack app'
    },
    KmsKey: {
      Type: 'String',
      Description: 'Cloudformation-kms stack name or KMS key ARN'
    }
  },
  statements: [
    {
      Effect: 'Allow',
      Action: [
        'kms:Decrypt'
      ],
      Resource: {
        'Fn::ImportValue': {
          'Ref': 'KmsKey'
        }
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
