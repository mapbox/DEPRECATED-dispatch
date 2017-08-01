var AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
var sns = new AWS.SNS();

let msg = {
  priority: 'self-service'
}

var params = {
  Subject: 'Testing SNS',
  MessageStructure: 'string',
  Message: JSON.stringify(msg),
  TopicArn: 'arn:aws:sns:us-east-1:234858372212:dispatch-olivia-dispatchIncoming'
};
console.log(params.Message);
sns.publish(params, function(err, data) {
  if (err) console.log(err, err.stack); // an error occurred
  else     console.log(data);           // successful response
});
