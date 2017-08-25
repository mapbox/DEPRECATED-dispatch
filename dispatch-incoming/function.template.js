var lambdaCfn = require('@mapbox/lambda-cfn');

module.exports = lambdaCfn.build({
  name: 'dispatchIncoming',
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
    },
    OracleUrl: {
      Type: 'String',
      Description: 'User oracle URL '
    },
    OracleSecret: {
      Type: 'String',
      Description: '[secure] User oracle shared secret'
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
