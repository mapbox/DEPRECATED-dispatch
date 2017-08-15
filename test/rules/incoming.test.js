'use strict';
const tape = require('tape');
const nock = require('nock');
const incoming = require('../../rules/incoming.js').fn;
process.env.dispatchIncomingPagerDutyApiKey = 'FakeApiToken';
process.env.dispatchIncomingPagerDutyServiceId = 'XXXXXXX';
process.env.dispatchIncomingPagerDutyFromAddress = 'null@foo.bar';
process.env.dispatchIncomingGithubRepo = 'island';
process.env.dispatchIncomingGithubOwner = 'null';
process.env.dispatchIncomingGithubToken = 'FakeApiToken';

process.env.NODE_ENV = 'test'

const highPriorityEvent = {
  Records:
  [{ EventSource: 'aws:sns',
    Sns: {
      Message: JSON.stringify({
        priority: 'high'
      }),
    }
  }]
}

const selfServiceEvent = {
  Records:
  [{ EventSource: 'aws:sns',
    Sns: {
      Message: JSON.stringify({
        priority: 'self-service'
      }),
    }
  }]
}

tape('Creates a GH issue from self-service priority', function(assert) {
  let noIssue = []
  let ghIssue = require('../fixtures/github.js').issue1;

  nock('https://api.github.com')
    .get('/repos/null/island/issues')
    .query({state: 'open', access_token: 'FakeApiToken'})
    .reply(200, noIssue);

  nock('https://api.github.com:443', {"encodedQueryParams":true})
    .post('/repos/null/island/issues', {"title":"foobar","body":"hurry hurry","assignees":["null"]})
    .query({"access_token":"FakeApiToken"})
    .reply(201, ghIssue);

  incoming(selfServiceEvent, function(err, res) {
    console.log(res);
    assert.end();
  });
});

tape('Creates a PD incident from high priority', function(assert) {
  let pdIncident = require('../fixtures/pagerduty.js').incident;

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
