'use strict';

const lambdaCfn = require('@mapbox/lambda-cfn');
const cf = require('@mapbox/cloudfriend');

const lambdaTemplate = lambdaCfn.build({
  name: 'incoming',
  memorySize: '1536',
  timeout: '300',
  runtime: 'nodejs8.10',
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
    GitHubDefaultUser: {
      Type: 'String',
      Description: 'Default GitHub user or team to be tagged in dispatch issues'
    },
    GitHubOwner: {
      Type: 'String',
      Description: 'Owner of GitHub repo'
    },
    GitHubRepo: {
      Type: 'String',
      Description: 'Default GitHub repo for dispatch issues'
    },
    GitHubToken: {
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
    SlackDefaultChannel: {
      Type: 'String',
      Description: 'Default Slack channel for dispatch, MUST INCLUDE #'
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

module.exports = lambdaTemplate;
