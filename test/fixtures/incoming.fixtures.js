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
            users: [ { github: 'testUser', slack: 'testUser' }],
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
            users: [
              {
                slack: 'testUser1'
              },
              {
                slack: 'testUser2'
              },
              {
                slack: 'testUser3'
              }
            ],
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


module.exports.multipleRecords = {
  Records:
  [
    { EventSource: 'aws:sns',
      Sns: {
        Message: JSON.stringify(
          {
            type: 'self-service',
            users: [ { github: 'testUser', slack: 'testUser' }],
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
    },
    { EventSource: 'aws:sns',
      Sns: {
        Message: JSON.stringify(
          {
            type: 'broadcast',
            users: [
              {
                slack: 'testUser1'
              },
              {
                slack: 'testUser2'
              },
              {
                slack: 'testUser3'
              }
            ],
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
    },
    { EventSource: 'aws:sns',
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
    }
  ]
};
