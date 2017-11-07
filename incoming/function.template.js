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
      Description: 'Owner of the Github repo'
    },
    GithubRepo: {
      Type: 'String',
      Description: 'Github repo'
    },
    GithubToken: {
      Type: 'String',
      Description: '[secure] GitHub OAuth token'
    },
    SlackBotToken: {
      Type: 'String',
      Description: '[secure] Slack API bot token'
    },
    SlackChannel: {
      Type: 'String',
      Description: 'Slack channel for dispatch-bot'
    }
  },
  statements: [
    {
      Effect: 'Allow',
      Action: [
        'kms:Decrypt'
      ],
      Resource: {
        'Fn::ImportValue': 'cloudformation-kms-production'
      }
    }
  ],
  eventSources: {
    sns: {}
  }
});
