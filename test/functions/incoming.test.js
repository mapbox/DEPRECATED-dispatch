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
process.env.SlackDefaultChannel = '#testSlackDefaultChannel';

const context = {};
const gitHubDefaultUser = process.env.GitHubDefaultUser;
const slackDefaultChannel = process.env.SlackDefaultChannel;

const lambdaFailure = 'Lambda failure';
const lambdaSuccess = 'Lambda success';

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

test('[incoming] [checkUser] undefined user passed', (assert) => {
  let user = incoming.checkUser(undefined, gitHubDefaultUser, slackDefaultChannel, 'testRequestId', 'testMessageBody');
  assert.equal(user.defaulted, true, '-- undefined user defaulted');
  assert.equal(user.slackId, slackDefaultChannel, '-- undefined user set to default Slack channel');
  assert.equal(user.github, gitHubDefaultUser, '-- undefined user set to default GitHub user');
  assert.end();
});

test('[incoming] [callGitHub] missing Slack username, default to id', (assert) => {
  nock('https://api.github.com')
    .get(`/repos/${process.env.GitHubOwner}/${process.env.GitHubRepo}/issues`)
    .query({ state: 'open', access_token: process.env.GitHubToken })
    .reply(200, []);

  nock('https://api.github.com')
    .post(`/repos/${process.env.GitHubOwner}/${process.env.GitHubRepo}/issues`)
    .query({ access_token: process.env.GitHubToken })
    .reply(201, githubFixtures.broadcastIssue);

  incoming.callGitHub(incomingFixtures.callGitHubEvent.user, incomingFixtures.callGitHubEvent.messageBroadcastError, incomingFixtures.callGitHubEvent.requestId, process.env.GitHubOwner, process.env.GitHubRepo, process.env.GitHubToken, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, incomingFixtures.callGitHubEvent.res, '-- Github issue should be created');
    assert.end();
  });
});

test('[incoming] [fn] missing message priority', (assert) => {
  incoming.fn(incomingFixtures.missingPriorityEvent, context, (err) => {
    assert.deepEqual(err, lambdaFailure, '-- should return error message');
    assert.end();
  });
});

test('[incoming] [fn] [checkEvent] malformed SNS message error', (assert) => {
  incoming.fn(incomingFixtures.malformedSNS, context, (err) => {
    assert.equal(err, lambdaFailure, '-- should return error message');
    assert.end();
  });
});

test('[incoming] [fn] [checkEvent] > 1 record in SNS message error', (assert) => {
  incoming.fn(incomingFixtures.multipleRecordSNS, context, (err) => {
    assert.equal(err, lambdaFailure, '-- should return error message');
    assert.end();
  });
});

test('[incoming] [fn] [checkEvent] invalid JSON in SNS message', (assert) => {
  incoming.fn(incomingFixtures.invalidJsonSNS, context, (err) => {
    assert.equal(err, lambdaFailure, '-- should return error message');
    assert.end();
  });
});

test('[incoming] [fn] self-service event', (assert) => {
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

  incoming.fn(incomingFixtures.selfServiceEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, lambdaSuccess, '-- GitHub issue and Slack alert should be created');
    assert.end();
  });
});

test('[incoming] [fn] broadcast event', (assert) => {
  nock('https://api.github.com')
    .get(`/repos/${process.env.GitHubOwner}/${process.env.GitHubRepo}/issues`)
    .query({ state: 'open', access_token: process.env.GitHubToken })
    .reply(200, []);

  nock('https://api.github.com')
    .post(`/repos/${process.env.GitHubOwner}/${process.env.GitHubRepo}/issues`)
    .query({ access_token: process.env.GitHubToken })
    .reply(201, githubFixtures.broadcastIssue);

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

  incoming.fn(incomingFixtures.broadcastEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, lambdaSuccess, '-- Github issue and Slack alerts should be created');
    assert.end();
  });
});

test('[incoming] [fn] high-priority event', (assert) => {
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

  incoming.fn(incomingFixtures.highPriorityEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, lambdaSuccess, '-- PagerDuty incident should be triggered');
    assert.end();
  });
});

test('[incoming] [fn] unrecognized event fallback', (assert) => {
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

  incoming.fn(incomingFixtures.unrecognizedEvent, context, (err, res) => {
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, lambdaSuccess, '-- PagerDuty incident should be triggered');
    assert.end();
  });
});
