const tape = require('tape');
const nock = require('nock');
const githubRequests = require('../../lib/github.js');
const issuesFixtures = require('../fixtures/github.js');

const highPriorityEvent = {
  Records:
    [{ EventSource: 'aws:sns',
      Sns: {
        Type: 'Notification',
        MessageId: '',
        TopicArn: 'arn:aws:sns:us-east-1',
        Subject: null,
        Message: '{"priority":"self-service"}',
        Timestamp: '2017-08-02T21:57:08.932Z',
        SignatureVersion: '1',
        Signature: '',
        SigningCertUrl: '',
        UnsubscribeUrl: '',
        MessageAttributes: {}
      }
    }]
}

const selfServiceEvent = {
  Records:
    [{ EventSource: 'aws:sns',
      Sns: {
        Type: 'Notification',
        MessageId: '',
        TopicArn: 'arn:aws:sns:us-east-1',
        Subject: null,
        Message: '{"priority":"self-service"}',
        Timestamp: '2017-08-02T21:57:08.932Z',
        SignatureVersion: '1',
        Signature: '',
        SigningCertUrl: '',
        UnsubscribeUrl: '',
        MessageAttributes: {}
      }
    }]
}

tape('Creates a PD incident from high priority', function(assert) {

});

tape('Creates a GH issue from self-service priority', function(assert) {

})
