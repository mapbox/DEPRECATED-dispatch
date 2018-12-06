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

delete lambdaTemplate.Parameters.CodeS3Bucket;
delete lambdaTemplate.Parameters.CodeS3Prefix;
delete lambdaTemplate.Resources.incoming.Properties.Environment.Variables.CodeS3Bucket;
delete lambdaTemplate.Resources.incoming.Properties.Environment.Variables.CodeS3Prefix;

lambdaTemplate.Resources.incoming.Properties.Code.S3Bucket = cf.join('-', ['utility', cf.accountId, cf.region]);
lambdaTemplate.Resources.incoming.Properties.Code.S3Key = cf.join('', ['bundles/dispatch/', cf.ref('GitSha'), '.zip']);

module.exports = lambdaTemplate;
