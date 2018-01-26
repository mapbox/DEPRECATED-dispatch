'use strict';

const test = require('tape');
const nock = require('nock');

const triage = require('../../triage/function.js');
const triageFixtures = require('../fixtures/triage.fixtures.js');

process.env.GitHubOwner = 'testGitHubOwner';
process.env.GitHubRepo = 'testGitHubRepo';
process.env.GitHubToken = 'testGitHubToken';
process.env.PagerDutyApiKey = 'testPagerDutyApiKey';
process.env.PagerDutyFromAddress = 'testPagerDutyFromAddress';
process.env.PagerDutyServiceId = 'testPagerDutyServiceId';
process.env.SlackVerificationToken = 'testSlackVerificationToken';

const context = {};

test('[triage] [fn] [checkEvent] JSON parsing error', (assert) => {
  triage.fn(triageFixtures.invalidJSON, context, (err) => {
    assert.equal(err, 'Error - parsing dispatch triage event payload', '-- should return error message');
    assert.end();
  });
});

test('[triage] [fn] [checkEvent] invalid Slack verification token', (assert) => {
  triage.fn(triageFixtures.badToken, context, (err) => {
    assert.equal(err, 'Error - incorrect Slack verification token', '-- should return error message');
    assert.end();
  });
});

test('[triage] [fn] [checkEvent] >1 payload actions', (assert) => {
  triage.fn(triageFixtures.extraAction, context, (err) => {
    assert.equal(err, 'Error - found 2 actions in payload, expected 1', '-- should return error message');
    assert.end();
  });
});

test('[triage] [fn] response OK, closes GitHub issue', (assert) => {
  nock('https://api.github.com:443', { 'encodedQueryParams':true })
    .patch('/repos/testGitHubOwner/testGitHubRepo/issues/7', { 'state': 'closed' })
    .query({ access_token: 'testGitHubToken' })
    .reply(200, {});

  triage.fn(triageFixtures.ok, context, (err, res) => {
    // replace dynamic timestamp for tape deepEqual
    res.attachments[0].ts = 'testTimeStamp';
    assert.ifError(err, '-- should not error');
    assert.deepEqual(res, triageFixtures.responses.ok, '-- should return responseObject for Slack');
    assert.end();
  });
});

test('[triage] [fn] response OK, error closing GitHub issue', (assert) => {
  nock('https://api.github.com:443', { 'encodedQueryParams':true })
    .patch('/repos/testGitHubOwner/testGitHubRepo/issues/7', { 'state': 'closed' })
    .query({ access_token: 'testGitHubToken' })
    .reply(404, 'Bad request');

  triage.fn(triageFixtures.ok, context, (err, res) => {
    assert.equal(err, null, '-- err should be null, logged to Slack instead');
    assert.deepEqual(res, triageFixtures.responses.okError, '-- should return responseError for Slack');
    assert.end();
  });
});

test('[triage] [fn] response NOT OK, escalates to PagerDuty', (assert) => {
  nock('https://api.pagerduty.com:443', { 'encodedQueryParams': true })
    .post('/incidents', {
      incident: {
        type: 'incident',
        title: 'dispatch 6cf9397c71e2: user kara responded \'no\' for self-service issue 7',
        service: {
          id: 'testPagerDutyServiceId',
          type: 'service_reference'
        },
        incident_key: '6cf9397c71e2',
        body: {
          type: 'incident_body',
          details: 'dispatch 6cf9397c71e2: user kara responded \'no\' for self-service issue 7\n\n https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
        }
      }
    })
    .reply(201, triageFixtures.incident);

  triage.fn(triageFixtures.notOk, context, (err, res) => {
    // replace dynamic timestamp for tape deepEqual
    res.attachments[0].ts = 'testTimeStamp';
    assert.equal(err, null, '-- err should be null, logged to Slack instead');
    assert.deepEqual(res, triageFixtures.responses.notOk, '-- should return responseObject for Slack');
    assert.end();
  });
});

// NOTE: Missing test for duplicate PagerDuty issue error

test('[triage] [fn] response NOT OK, error escalating to PagerDuty', (assert) => {
  nock('https://api.pagerduty.com:443', { 'encodedQueryParams': true })
    .post('/incidents', {
      incident: {
        type: 'incident',
        title: 'dispatch 6cf9397c71e2: user kara responded \'no\' for self-service issue 7',
        service: {
          id: 'testPagerDutyServiceId',
          type: 'service_reference'
        },
        incident_key: '6cf9397c71e2',
        body: {
          type: 'incident_body',
          details: 'dispatch 6cf9397c71e2: user kara responded \'no\' for self-service issue 7\n\n https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
        }
      }
    })
    .reply(400, {
      error: {
        message: 'Bad request',
        code: 400,
        errors: [ 'test bad request' ]
      }
    });

  triage.fn(triageFixtures.notOk, context, (err, res) => {
    assert.equal(err, null, '-- err should be null, logged to Slack instead');
    assert.deepEqual(res, triageFixtures.responses.notOkError, '-- should return responseError for Slack');
    assert.end();
  });
});