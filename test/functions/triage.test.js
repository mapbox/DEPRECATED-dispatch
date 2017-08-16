'use strict';

const tape = require('tape');
const nock = require('nock');
const triage = require('../../dispatch-triage/function.js').fn;

process.env.PagerDutyApiKey = 'FakeApiToken';
process.env.PagerDutyServiceId = 'XXXXXXX';
process.env.PagerDutyFromAddress = 'null@foo.bar';
process.env.GithubRepo = 'island';
process.env.GithubOwner = 'null';
process.env.GithubToken = 'FakeApiToken';

var okResponseEvent = require('../../test/fixtures/triage/ok');
var notOkResponseEvent = require('../../test/fixtures/triage/notok');

tape('Closes Github issue if ok', function(t) {

  nock('https://api.github.com:443', {"encodedQueryParams":true})
    .patch('/repos/null/island/issues/1', {"state":"closed"})
    .query({"access_token":"FakeApiToken"})
    .reply(200, {});

  triage(okResponseEvent, null, function(err, res) {
    t.error(err, 'Github issue closed successfully');
    t.end();
  });

});

tape('Escalates to PagerDuty if not ok', function(t) {
  let pdIncident = require('../fixtures/pagerduty.js').incident;

  nock('https://api.pagerduty.com:443', {"encodedQueryParams":true})
    .post('/incidents', {"incident": {
      "type":"incident",
      "title":"everything is not ok", // TODO this title is hardcoded in the triage lambda function
      "service": {
        "id":"XXXXXXX",
        "type":"service_reference" },
      "incident_key":"testing" }
    })
    .reply(201, pdIncident);

  triage(notOkResponseEvent, {}, function(err, res) {
    t.error(err, 'Escalates to PagerDuty successfully');
    t.end();
  });
});
