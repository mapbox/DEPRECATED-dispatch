'use strict';

module.exports.highPriorityEvent = {
  Records:
  [{ EventSource: 'aws:sns',
    Sns: {
      Message: JSON.stringify({
        type: 'high',
        body: {
          pagerduty: {
            title: 'testPagerDutyTitle'
          }
        }
      })
    }
  }]
};

module.exports.selfServiceEvent = {
  Records:
  [
    { EventSource: 'aws:sns',
      Sns: {
        Message: JSON.stringify(
          {
            type: 'self-service',
            users: ['testUser'],
            body: {
              github: {
                title: 'testGithubTitle',
                body: 'testGithubBody'
              },
              slack: {
                message: 'testSlackMessage',
                actions: {
                  yes: 'testYesAction',
                  no: 'testNoAction'
                }
              }
            }
          }
        )
      }
    }
  ]
};

module.exports.broadcastEvent = {
  Records:
  [
    { EventSource: 'aws:sns',
      Sns: {
        Message: JSON.stringify(
          {
            type: 'broadcast',
            users: ['testUser1', 'testUser2', 'testUser3'],
            body: {
              github: {
                title: 'testGithubTitle',
                body: 'testGithubBody'
              },
              slack: {
                message: 'testSlackMessage'
              }
            }
          }
        )
      }
    }
  ]
};
