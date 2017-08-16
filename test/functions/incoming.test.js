'use strict';

const tape = require('tape');
const nock = require('nock');
const incoming = require('../../dispatch-incoming/function.js').fn;

process.env.PagerDutyApiKey = 'FakeApiToken';
process.env.PagerDutyServiceId = 'XXXXXXX';
process.env.PagerDutyFromAddress = 'null@foo.bar';
process.env.GithubRepo = 'island';
process.env.GithubOwner = 'null';
process.env.GithubToken = 'FakeApiToken';

const highPriorityEvent = {
  Records:
  [{ EventSource: 'aws:sns',
    Sns: {
      Message: JSON.stringify({
        priority: 'high',
        title: 'this is a test'
      }),
    }
  }]
}

const selfServiceEvent = {
  Records:
  [{ EventSource: 'aws:sns',
    Sns: {
      Message: JSON.stringify({
        priority: 'self-service',
        title: 'foobar',
        body: 'hurry hurry'
      }),
    }
  }]
}

tape('[incoming] Creates a GH issue from self-service priority', function(assert) {
  let noIssue = [];
  let ghIssue = require('../fixtures/github.fixtures.js').issue1;
  let actualResult = {
    priority: 'self-service',
    title: 'foobar',
    body: 'hurry hurry',
    githubIssue: 1 }

  nock('https://api.github.com')
    .get('/repos/null/island/issues')
    .query({state: 'open', access_token: 'FakeApiToken'})
    .reply(200, noIssue);

  nock('https://api.github.com:443', {"encodedQueryParams":true})
    .post('/repos/null/island/issues', {"title":"foobar","body":"hurry hurry","assignees":["null"]})
    .query({"access_token":"FakeApiToken"})
    .reply(201, ghIssue);

  incoming(selfServiceEvent, {}, function(err, res) {
    assert.deepEqual(res, actualResult, 'Github issue created');
    assert.end();
  });
});

tape('[incoming] Creates a PD incident from high priority', function(assert) {
  let pdIncident = require('../fixtures/pagerduty.fixtures.js').incident;

  nock('https://api.pagerduty.com:443', {"encodedQueryParams":true})
    .post('/incidents', {"incident": {
      "type":"incident",
      "title":"this is a test",
      "service": {
        "id":"XXXXXXX",
        "type":"service_reference" },
      "incident_key":"testing" }
    })
    .reply(201, pdIncident);

  incoming(highPriorityEvent, {}, function(err, res) {
    assert.deepEqual(res, 'pagerduty incident triggered', 'PD incident was triggered')
    assert.end();
  });
});

tape('[incoming] Throws error if there is more than 1 record', function(assert) {
  let badRecord = { Records: [ 'record1', 'record2'] }

  incoming(badRecord, {}, function(err, res) {
    assert.deepEqual(err, 'SNS contains more than one record.', 'Function returned error.')
    assert.end();
  })
})
