'use strict';

module.exports.missingPriorityEvent = {
  Records:
  [
    { EventSource: 'aws:sns',
      Sns: {
        Message: JSON.stringify(
          {
            users: [ { github: 'testGitHubUser', slack: 'testSlackUser', slackId: 'testSlackId' }],
            body: {
              github: {
                title: 'testGitHubTitle',
                body: 'testGitHubBody'
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
                slack: 'testSlackUser1',
                slackId: 'testSlackId1'
              },
              {
                slack: 'testSlackUser2',
                slackId: 'testSlackId2'
              },
              {
                slack: 'testSlackUser3',
                slackId: 'testSlackId3'
              }
            ],
            body: {
              github: {
                title: 'testGithubTitle',
                body: 'testGithubBody'
              },
              pagerduty: {
                title: 'testPagerDutyTitle'
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

module.exports.highPriorityEvent = {
  Records:
  [{ EventSource: 'aws:sns',
    Sns: {
      Message: JSON.stringify({
        type: 'high-priority',
        body: {
          pagerduty: {
            title: 'testPagerDutyTitle'
          }
        },
        requestId: 'testRequestId'
      })
    }
  }]
};

module.exports.unrecognizedEvent = {
  Records:
  [{ EventSource: 'aws:sns',
    Sns: {
      Message: JSON.stringify({
        type: 'unrecognized',
        body: {
          pagerduty: {
            title: 'testPagerDutyTitle'
          }
        },
        requestId: 'testRequestId'
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
            users: [ { github: 'testGitHubUser', slack: 'testSlackUser', slackId: 'testSlackId' }],
            body: {
              github: {
                title: 'testGitHubTitle',
                body: 'testGitHubBody'
              },
              pagerduty: {
                title: 'testPagerDutyTitle'
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

module.exports.userMissingGitHub = {
  slackId: 'testSlackId'
};

module.exports.userDefautGitHub = {
  slackId: 'testSlackId',
  github: 'testGitHubDefaultUser'
};

module.exports.userMissingSlack = {
  github: 'testGitHubUsername'
};

module.exports.userDefautSlack = {
  github: 'testGitHubUsername',
  slack: '#testSlackDefaultChannel'
};

module.exports.malformedSNS = {
  Records: 'garbage'
};

module.exports.multipleRecordSNS = {
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

module.exports.invalidJsonSNS = {
  Records:
  [{ EventSource: 'aws:sns',
    Sns: {
      Message: 'garbage JSON'
    }
  }]
};