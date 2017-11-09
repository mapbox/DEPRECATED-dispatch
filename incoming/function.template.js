'use strict';

const lambdaCfn = require('@mapbox/lambda-cfn');

module.exports = lambdaCfn.build({
  name: 'incoming',
  memorySize: '1536',
  timeout: '300',
  parameters: {
    PagerDutyApiKey: {
      Type: 'String',
      Description: '[secure] PagerDuty API key'
    },
    PagerDutyFromAddress: {
      Type: 'String',
      Description: 'PagerDuty account email address'
    },
    PagerDutyServiceId: {
      Type: 'String',
      Description: 'PagerDuty service ID'
    },
    GithubDefaultUser: {
      Type: 'String',
      Description: 'Default GitHub user to be tagged in dispatch issues'
    },
    GithubOwner: {
      Type: 'String',
      Description: 'Owner of GitHub repo'
    },
    GithubRepo: {
      Type: 'String',
      Description: 'Default GitHub repo for dispatch issues'
    },
    GithubToken: {
      Type: 'String',
      Description: '[secure] GitHub OAuth token'
    },
    KmsKey: {
      Type: 'String',
      Description: 'cloudformation-kms stack name or KMS key ARN'
    },
    SlackBotToken: {
      Type: 'String',
      Description: '[secure] Slack API bot token'
    },
    SlackChannel: {
      Type: 'String',
      Description: 'Default Slack channel for dispatch-bot'
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
    sns: {}
  }
});
