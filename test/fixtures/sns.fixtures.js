{
  "Records": [
    {
      "EventSource": "aws:sns",
      "EventVersion": "1.0",
      "EventSubscriptionArn": "eventARN",
      "Sns": {
        "Type": "Notification",
        "MessageId": "",
        "TopicArn": "arn:aws:sns:us-east-1",
        "Subject": "HELLO",
        "Message": "{\"type\":\"self-service\",\"users\":[\"testUser\"],\"issue\":\"7\",\"url\":\"https://api.github.com/repos/testOwner/testRepo/issues/7\",\"body\":{\"github\":{\"title\":\"Test title\",\"body\":\"test body\"},\"slack\":{\"message\":\"testSlackMessage\",\"actions\":{\"yes\":\"testYesAction\",\"no\":\"testNoAction\"}}}}",
        "Timestamp": "2017-08-02T21:57:08.932Z",
        "SignatureVersion": "1",
        "Signature": "",
        "SigningCertUrl": "",
        "UnsubscribeUrl": "",
        "MessageAttributes": {
        }
      }
    }
  ]
}
