'use strict';

const tape = require('tape');
const nock = require('nock');
const triage = require('../../triage/function.js').fn;

process.env.PagerDutyApiKey = 'FakeApiToken';
process.env.PagerDutyServiceId = 'XXXXXXX';
process.env.PagerDutyFromAddress = 'null@foo.bar';
process.env.GithubRepo = 'testRepo';
process.env.GithubOwner = 'testOwner';
process.env.GithubToken = 'FakeApiToken';
process.env.SlackVerificationToken = 'fakeSlackToken';

const okResponseEvent = require('../../test/fixtures/triage/ok');
const notOkResponseEvent = require('../../test/fixtures/triage/notok');
const badTokenResponseEvent = require('../../test/fixtures/triage/badtoken');

tape('[triage] Closes Github issue if ok', function(t) {

  nock('https://api.github.com:443', {'encodedQueryParams':true})
    .patch('/repos/testOwner/testRepo/issues/7', {'state':'closed'})
    .query({'access_token':'FakeApiToken'})
    .reply(200, {});

  triage(okResponseEvent, null, function(err) {
    t.error(err, 'Github issue closed successfully');
    t.end();
  });

});

tape('[triage] Fails on incorrect Slack verification token', function(t) {

  nock('https://api.github.com:443', {'encodedQueryParams':true})
    .patch('/repos/testOwner/testRepo/issues/7', {'state':'closed'})
    .query({'access_token':'FakeApiToken'})
    .reply(200, {});

  triage(badTokenResponseEvent, null, function(err) {
    t.equal(err, 'error: incorrect Slack verification token');
    t.end();
  });

});

tape('[triage] Escalates to PagerDuty if not ok', function(t) {
  let pdIncident = require('../fixtures/pagerduty.fixtures.js').incident;

  nock('https://api.pagerduty.com:443', {'encodedQueryParams':true})
    .post('/incidents', {
      'incident': {
        'type': 'incident',
        'title': '6cf9397c71e2: user kara responded \'no\' for self-service issue 7',
        'service': {
          'id':'XXXXXXX',
          'type': 'service_reference'
        },
        'incident_key': '6cf9397c71e2',
        'body': {
          'type': 'incident_body',
          'details': '6cf9397c71e2: user kara responded \'no\' for self-service issue 7\n\n https:\/\/github.com\/testOwner\/testRepo\/issues\/7'
        }
      }
    })
    .reply(201, pdIncident);

  triage(notOkResponseEvent, {}, function(err) {
    t.error(err, 'Escalates to PagerDuty successfully');
    t.end();
  });
});
