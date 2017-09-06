var AWS = require('aws-sdk');
var crypto = require('crypto');

var sns = new AWS.SNS();

if (!process.env.SNSARN) {
  console.log('Please set $SNSARN before testing');
}
if (!process.env.VOLUME) {
  console.log('Please set $VOLUME before testing');
}
if (!process.env.TESTUSER) {
  console.log('Please set $TESTUSER before testing');
}

var arn = process.env.SNSARN;
var volume = process.env.VOLUME;
var testUser = process.env.TESTUSER;
var title = crypto.randomBytes(6).toString('hex');

var msg = {
  type: 'broadcast',
  users: [],
  body: {
    github: {
      body: 'volume broadcast test, please ignore'
    },
    slack: {
      message: 'This is a test of a broadcast dispatch, please ignore'
    }
  }
};

for (var i=0; i < volume; i++) {
  msg.users.push({github: testUser, slack: testUser});
}

msg.body.github.title = title;

var params = {
  Message: JSON.stringify(msg),
  TopicArn: arn
};
sns.publish(params, function(err,data) {
  if (err) return console.log(err);
  console.log(data);
});
