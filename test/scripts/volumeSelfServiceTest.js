var d3 = require('d3-queue');
var AWS = require('aws-sdk');
var crypto = require('crypto');

var sns = new AWS.SNS();

if (!process.env.SNSARN) {
  console.log('Please set $SNSARN before testing');
  process.exit(1);
}
if (!process.env.VOLUME) {
  console.log('Please set $VOLUME before testing');
  process.exit(1);
}
if (!process.env.TESTUSER) {
  console.log('Please set $TESTUSER before testing');
  process.exit(1);
}

var arn = process.env.SNSARN;
var volume = process.env.VOLUME;
var testUser = process.env.TESTUSER;

var msg = {
  type:'self-service',
  users: [
    {
      slack: testUser,
      github: testUser
    }
  ],
  body: {
    github: {
      body: 'test'
    },
    slack: {
      message:'This is a test of a self-service dispatch',
      actions: {
        yes:'Oh yeah!',
        no:'Oh no!'
      }
    }
  }
};

var q = d3.queue(1);

function generateMessage(message, title, next) {
  message.body.github.title = title;
  var params = {
    Message: JSON.stringify(message),
    TopicArn: arn
  };
  sns.publish(params, function(err,data) {
    if (err) return next(err);
    return next(null, data);
  });
};

for (var i = 0; i < volume; i++) {
  var title = crypto.randomBytes(6).toString('hex');
  console.log(`Queuing dispatch with GitHub title ${title}`);
  q.defer(generateMessage, msg, title);
}

q.awaitAll(function(err,data) {
  console.log(err);
  console.log(data);
});
