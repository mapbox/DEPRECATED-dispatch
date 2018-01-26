'use strict';

const test = require('tape');
const nock = require('nock');

const incoming = require('../../incoming/function.js');
const incomingFixtures = require('../../test/fixtures/incoming.fixtures.js');
const githubFixtures = require('../fixtures/github.fixtures.js');
const pagerDutyFixtures = require('../fixtures/pagerduty.fixtures.js');
const slackFixtures = require('../../test/fixtures/slack.fixtures.js');

process.env.PagerDutyApiKey = 'testPagerDutyApiKey';
process.env.PagerDutyFromAddress = 'testPagerDutyFromAddress';
process.env.PagerDutyServiceId = 'testPagerDutyServiceId';
process.env.GitHubDefaultUser = 'testGitHubDefaultUser';
process.env.GitHubOwner = 'testGitHubOwner';
process.env.GitHubRepo = 'testGitHubRepo';
process.env.GitHubToken = 'testGitHubToken';
process.env.SlackBotToken = 'testSlackBotToken';
process.env.SlackDefaultChannel = 'testSlackDefaultChannel';

const context = {};
const requestId = 'testRequestId';
const gitHubDefaultUser = process.env.GitHubDefaultUser;
const slackDefaultChannel = process.env.SlackDefaultChannel;

test('[incoming] [checkUser] missing GitHub username', (assert) => {
  let user = incoming.checkUser(incomingFixtures.userMissingGitHub, gitHubDefaultUser, slackDefaultChannel);
  assert.deepEqual(user, incomingFixtures.userDefautGitHub, '-- should replace missing GitHub username with testGitHubDefaultUser');
  assert.end();
});

test('[incoming] [checkUser] missing Slack username', (assert) => {
  let user = incoming.checkUser(incomingFixtures.userMissingSlack, gitHubDefaultUser, slackDefaultChannel);
  assert.deepEqual(user, incomingFixtures.userDefautSlack, '-- should replace missing Slack username with testSlackDefaultChannel');
  assert.end();
});

test('[incoming] [lambda] missing message priority', (assert) => {
  incoming.lambda(incomingFixtures.missingPriorityEvent, context, (err) => {
    assert.deepEqual(err, 'Error - No dispatch message priority found in SNS message', '-- should return error message');
    assert.end();
  });
});

test('[incoming] [lambda] [checkEvent] malformed SNS message error', (assert) => {
  incoming.lambda(incomingFixtures.malformedSNS, context, (err) => {
    assert.equal(err, 'Error - SNS message malformed', '-- should return error message');
    assert.end();
  });
});

test('[incoming] [lambda] [checkEvent] > 1 record in SNS message error', (assert) => {
  incoming.lambda(incomingFixtures.multipleRecordSNS, context, (err) => {
    assert.equal(err, 'Error - SNS message contains more than one record', '-- should return error message');
    assert.end();
  });
});

test('[incoming] [lambda] [checkEvent] invalid JSON in SNS message', (assert) => {
  incoming.lambda(incomingFixtures.invalidJsonSNS, context, (err) => {
    assert.equal(err, 'Error - SNS message contains invalid JSON', '-- should return error message');
    assert.end();
  });
});

test('[incoming] [lambda] self-service event', (assert) => {
  nock('https://api.github.com')
    .get(`/repos/${process.env.GitHubOwner}/${process.env.GitHubRepo}/issues`)
    .query({ state: 'open', access_token: process.env.GitHubToken })
    .reply(200, []);

  nock('https://api.github.com')
    .post(`/repos/${process.env.GitHubOwner}/${process.env.GitHubRepo}/issues`)
    .query({ access_token: process.env.GitHubToken })
    .reply(201, githubFixtures.selfServiceIssue);

  nock('https://slack.com:443')
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443')
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);

  incoming.lambda(incomingFixtures.selfServiceEvent, context, (err, status) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(status, slackFixtures.slack.statusIncomingSelfService, '-- GitHub issue and Slack alert should be created');
    assert.end();
  });
});

test('[incoming] [lambda] broadcast event', (assert) => {
  nock('https://api.github.com')
    .get(`/repos/${process.env.GitHubOwner}/${process.env.GitHubRepo}/issues`)
    .query({ state: 'open', access_token: process.env.GitHubToken })
    .reply(200, []);

  nock('https://api.github.com')
    .post(`/repos/${process.env.GitHubOwner}/${process.env.GitHubRepo}/issues`)
    .query({ access_token: process.env.GitHubToken })
    .reply(201, githubFixtures.selfServiceIssue);

  // slack calls for [ 'testSlackUser1', 'testSlackUser2', 'testSlackUser3' ]
  nock('https://slack.com:443')
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443')
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443')
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443')
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443')
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);
  nock('https://slack.com:443')
    .post('/api/chat.postMessage')
    .reply(200, slackFixtures.slack.success);

  incoming.lambda(incomingFixtures.broadcastEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, slackFixtures.slack.statusBroadcast, '-- Github issue and Slack alerts should be created');
    assert.end();
  });
});

test('[incoming] [lambda] high-priority event', (assert) => {
  let pagerDutyStatus = `dispatch ${requestId} - PagerDuty incident triggered`;

  nock('https://api.pagerduty.com:443', { encodedQueryParams: true })
    .post('/incidents', {
      incident: {
        type: 'incident',
        title: 'testPagerDutyTitle',
        service: {
          id: 'testPagerDutyServiceId',
          type: 'service_reference'
        },
        incident_key: 'testPagerDutyTitle'
      }
    })
    .reply(201, pagerDutyFixtures.incident);

  incoming.lambda(incomingFixtures.highPriorityEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, pagerDutyStatus, '-- PagerDuty incident should be triggered');
    assert.end();
  });
});

test('[incoming] [lambda] unrecognized event fallback', (assert) => {
  let pagerDutyStatus = `dispatch ${requestId} - no recognized message priority, defaulted to PagerDuty alert`;

  nock('https://api.pagerduty.com:443', { encodedQueryParams: true })
    .post('/incidents', {
      incident: {
        type: 'incident',
        title: 'testPagerDutyTitle',
        service: {
          id: 'testPagerDutyServiceId',
          type: 'service_reference'
        },
        incident_key: 'testPagerDutyTitle'
      }
    })
    .reply(201, pagerDutyFixtures.incident);

  incoming.lambda(incomingFixtures.unrecognizedEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, pagerDutyStatus, '-- PagerDuty incident should be triggered');
    assert.end();
  });
});