var lambdaCfn = require('@mapbox/lambda-cfn');
var cf = require('@mapbox/cloudfriend');

module.exports = lambdaCfn.build({
  name: 'dispatchIncoming',
  runtime: 'nodejs4.3',
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
        "Fn::ImportValue":"cloudformation-kms-production"
      }
    }
  ],
  eventSources: {
    sns: {}
  }
});
