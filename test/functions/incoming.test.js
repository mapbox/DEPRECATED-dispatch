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
const incoming = require('../../incoming/function.js').fn;
const incomingFixtures = require('../../test/fixtures/incoming.fixtures.js');
const githubFixtures = require('../fixtures/github.fixtures.js');
const slackFixtures = require('../../test/fixtures/slack.fixtures.js');
const pdIncident = require('../fixtures/pagerduty.fixtures.js').incident;

const context = {};

tape('[incoming] self-service', (assert) => {
  nock('https://api.github.com')
    .get('/repos/testOwner/testRepo/issues')
    .query({state: 'open', 'access_token': 'FakeApiToken'})
    .reply(200, []);

  nock('https://api.github.com', {encodedQueryParams:true})
    .post('/repos/testOwner/testRepo/issues', {
      title: 'testGithubTitle',
      body: 'testGithubBody\n\n @testUser'
    })
    .query({'access_token':'FakeApiToken'})
    .reply(201, githubFixtures.issue1);

  nock('https://slack.com:443', {'encodedQueryParams':true})
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443', {'encodedQueryParams':true})
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);

  incoming(incomingFixtures.selfServiceEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, slackFixtures.slack.status, '-- Github issue and Slack alert should be created');
    assert.end();
  });
});

tape('[incoming] broadcast', (assert) => {
  nock('https://api.github.com')
    .get('/repos/testOwner/testRepo/issues')
    .query({state: 'open', access_token: 'FakeApiToken'}) // eslint-disable-line camelcase
    .reply(200, []);

  nock('https://api.github.com', {encodedQueryParams: true})
    .post('/repos/testOwner/testRepo/issues', {
      title: 'testGithubTitle',
      body: 'testGithubBody\n\ntestUser1,testUser2,testUser3'
    })
    .query({'access_token':'FakeApiToken'})
    .reply(201, githubFixtures.broadcastIssue);

  // slack calls for [ 'testUser1', 'testUser2', 'testUser3' ]
  nock('https://slack.com:443', {'encodedQueryParams':true})
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443', {'encodedQueryParams':true})
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443', {'encodedQueryParams':true})
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443', {'encodedQueryParams':true})
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443', {'encodedQueryParams':true})
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443', {'encodedQueryParams':true})
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);

  incoming(incomingFixtures.broadcastEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, slackFixtures.slack.statusBroadcast, '-- Github issue and Slack alert should be created');
    assert.end();
  });
});

tape('[incoming] Creates a PD incident from high priority', (assert) => {
  nock('https://api.pagerduty.com:443', {encodedQueryParams: true})
    .post('/incidents', {
      incident: {
        type: 'incident',
        title: 'testPagerDutyTitle',
        service: {
          id: 'XXXXXXX',
          type: 'service_reference'
        },
        incident_key: 'testPagerDutyTitle' // eslint-disable-line camelcase
      }
    })
    .reply(201, pdIncident);

  incoming(incomingFixtures.highPriorityEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, '123 pagerduty incident triggered', '-- PD incident should be triggered');
    assert.end();
  });
});

tape('[incoming] malformed SNS message error', (assert) => {
  const badRecord = { Records: 'record1' };
  incoming(badRecord, context, (err) => {
    assert.deepEqual(err, 'SNS message malformed', '-- should pass through error message');
    assert.end();
  });
});

tape('[incoming] > 1 record in SNS message error', (assert) => {
  const badRecord = { Records: [ 'record1', 'record2'] };
  incoming(badRecord, context, (err) => {
    assert.deepEqual(err, 'SNS message contains more than one record', '-- should pass through error message');
    assert.end();
  });
});
