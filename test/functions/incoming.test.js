'use strict';

process.env.PagerDutyApiKey = 'FakeApiToken';
process.env.PagerDutyServiceId = 'XXXXXXX';
process.env.PagerDutyFromAddress = 'null@foo.bar';
process.env.GithubRepo = 'testRepo';
process.env.GithubOwner = 'testOwner';
process.env.GithubToken = 'FakeApiToken';
process.env.SlackChannel = 'testChannel';

const tape = require('tape');
const nock = require('nock');
const sinon = require('sinon');
const incoming = require('../../dispatch-incoming/function.js').fn;
const slack = require('../../lib/slack.js');
const slackFixtures = require('../../test/fixtures/slack.fixtures.js');

const highPriorityEvent = {
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

const highPriorityEventWithBody = {
  Records:
  [{ EventSource: 'aws:sns',
     Sns: {
       Message: JSON.stringify({
         type: 'high',
         body: {
           pagerduty: {
             title: 'testPagerDutyTitle',
             body: 'testPagerDutyBody'
           }
         }
       })
     }
   }]
};

const selfServiceEvent = {
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

const BroadcastEvent = {
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

tape('[incoming] Creates a GH issue and Slack alert for self-service priority', function(assert) {
  let noIssue = [];
  let ghIssue = require('../fixtures/github.fixtures.js').issue1;

  nock('https://api.github.com')
    .get('/repos/testOwner/testRepo/issues')
    .query({state: 'open', access_token: 'FakeApiToken'})
    .reply(200, noIssue);

  nock('https://api.github.com', {encodedQueryParams:true})
    .post('/repos/testOwner/testRepo/issues', {
      title: 'testGithubTitle',
      body: 'testGithubBody\n\n @testUser'
    })
    .query({"access_token":"FakeApiToken"})
    .reply(201, ghIssue);

  nock('https://slack.com:443', {"encodedQueryParams":true})
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);

  incoming(selfServiceEvent, {}, function(err, res) {
    assert.notOk(err, 'Does not error');
    assert.deepEqual(res, slackFixtures.slack.statusFinal, 'Github issue and Slack alert created');
    assert.end();
  });

});

tape('[incoming] Creates a PD incident from high priority', function(assert) {
  let pdIncident = require('../fixtures/pagerduty.fixtures.js').incident;

  nock('https://api.pagerduty.com:443', {"encodedQueryParams":true})
    .post('/incidents',
          {
            incident: {
              type: 'incident',
              title: 'testPagerDutyTitle',
              service: {
                id: 'XXXXXXX',
                type: 'service_reference'
              },
              incident_key: 'testPagerDutyTitle'
            }
          })
    .reply(201, pdIncident);

  nock('https://api.pagerduty.com:443', {"encodedQueryParams":true})
    .post('/incidents',
          {
            incident: {
              type: 'incident',
              title: 'testPagerDutyTitle',
              service: {
                id: 'XXXXXXX',
                type: 'service_reference'
              },
              body: {
                type: 'incident_body',
                details: 'testPagerDutyBody'
              },
              incident_key: 'testPagerDutyTitle'
            }
          })
    .reply(201, pdIncident);

  incoming(highPriorityEvent, {}, function(err, res) {
    assert.deepEqual(res, 'pagerduty incident triggered', 'PD incident was triggered');
    assert.end();
  });
});

tape('[incoming] Creates a PD incident from high priority with body', function(assert) {
  let pdIncident = require('../fixtures/pagerduty.fixtures.js').incidentWithBody;

  nock('https://api.pagerduty.com:443', {"encodedQueryParams":true})
    .post('/incidents',
          {
            incident: {
              type: 'incident',
              title: 'testPagerDutyTitle',
              service: {
                id: 'XXXXXXX',
                type: 'service_reference'
              },
              body: {
                type: 'incident_body',
                details: 'testPagerDutyBody'
              },
              incident_key: 'testPagerDutyTitle'
            }
          })
    .reply(201, pdIncident);

  incoming(highPriorityEventWithBody, {}, function(err, res) {
    assert.deepEqual(res, 'pagerduty incident triggered', 'PD incident was triggered');
    assert.end();
  });
});

tape('[incoming] Throws error if there is more than 1 record', function(assert) {
  let badRecord = { Records: [ 'record1', 'record2'] };

  incoming(badRecord, {}, function(err, res) {
    assert.deepEqual(err, 'SNS message contains more than one record', 'Function returned error.');
    assert.end();
  });
});
