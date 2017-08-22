'use strict';

const tape = require('tape');
const nock = require('nock');
const sinon = require('sinon');
const incoming = require('../../dispatch-incoming/function.js').fn;
const slack = require('../../lib/slack.js');
const slackFixtures = require('../../test/fixtures/slack.fixtures.js');

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

  nock('https://api.github.com')
    .get('/repos/null/island/issues')
    .query({state: 'open', access_token: 'FakeApiToken'})
    .reply(200, noIssue);

  nock('https://api.github.com:443', {"encodedQueryParams":true})
    .post('/repos/null/island/issues', {"title":"foobar","body":"hurry hurry","assignees":["null"]})
    .query({"access_token":"FakeApiToken"})
    .reply(201, ghIssue);

  const stub = sinon.stub(slack, 'alertToSlack').returns(null, slackFixtures.slack.status);

  incoming(selfServiceEvent, {}, function(err, res) {
    console.log(`ERR: ${err}`);
    console.log(res);
    assert.deepEqual(res, slackFixtures.slack.statusFinal, '-- Github issue created and Slack alerts');
    assert.end();
  });
  slack.alertToSlack.restore();
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
