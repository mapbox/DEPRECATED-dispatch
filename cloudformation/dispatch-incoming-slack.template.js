var cf = require('cloudfriend');

module.exports = {
  AWSTemplateFormatVersion: '2010-09-09',
  Description: 'Test of dispatch-incoming lambda Slack functionality',
  Parameters: {
    GitSha: {
      Type: 'String',
      Description: 'GitSha to deploy'
    },
    AlarmEmail: {
      Type: 'String',
      Description: 'Email to send alarms about post-to-slack performance to',
      Default: 'devnull@mapbox.com'
    },
    SlackURL: {
      Type: 'String',
      Description: 'Webhook URL to which to post messages',
      Default: 'https://hooks.slack.com/services/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'
    }
  },
  Resources: {
    AlarmTopic: {
      Type: 'AWS::SNS::Topic',
      Properties: {
        Subscription: [
          {
            Endpoint: cf.ref('AlarmEmail'),
            Protocol: 'email'
          }
        ]
      }
    },
    DispatchIncomingSlackTopic: {
      Type: 'AWS::SNS::Topic',
      Properties: {
        TopicName: cf.join('-', [cf.stackName, cf.region]),
        Subscription: [
          {
            Endpoint: cf.getAtt('DispatchIncomingSlackFunction', 'Arn'),
            Protocol: 'lambda'
          }
        ]
      }
    },
    SNSPermission: {
      Type: 'AWS::Lambda::Permission',
      Properties: {
        Action: 'lambda:invokeFunction',
        FunctionName: cf.ref('DispatchIncomingSlackFunction'),
        Principal: 'sns.amazonaws.com',
        SourceArn: cf.ref('DispatchIncomingSlackTopic')
      }
    },
    DispatchIncomingSlackFunction: {
      Type : 'AWS::Lambda::Function',
      Properties : {
        Code: {
          S3Bucket: cf.join(['mapbox-', cf.region]),
          S3Key: cf.join(['slugs/dispatch-incoming/', cf.ref('GitSha'), '.zip'])
        },
        Environment: {
          Variables: {
            SlackURL: cf.ref('SlackURL')
          }
        }
      }
    }
  },
  Outputs: {
    DispatchIncomingSlack: { Value: cf.ref('DispatchIncomingSlackTopic') }
  }
};