'use strict';

/* eslint-disable no-unused-vars */

const tape = require('tape');
const nock = require('nock');

const pagerduty = require('../../lib/pagerduty.js');
const fixtures = require('../fixtures/pagerduty.fixtures.js');

tape('[pagerduty] [createIncident] creates incident', (assert) => {
  let options = {
    accessToken: 'testPagerDutyApiKey',
    title: 'testIncidentTitle',
    serviceId: 'testServiceId',
    incidentKey: 'testIncidentKey',
    from: 'null@foo.bar'
  };

  nock('https://api.pagerduty.com:443', { 'encodedQueryParams': true })
    .post('/incidents', {
      incident: {
        type: 'incident',
        title: 'testIncidentTitle',
        service: {
          id: 'testServiceId',
          type: 'service_reference'
        },
        incident_key: 'testIncidentKey' }
    })
    .reply(201, fixtures.incident);

  pagerduty.createIncident(options)
    .then(res => {
      assert.deepEqual(res.body, fixtures.incident, '-- incident should be created');
      assert.end();
    })
    .catch(err => { console.log(err); });
});

tape('[pagerduty] [createIncident] creates incident with body', function(assert) {
  let options = {
    accessToken: 'testPagerDutyApiKey',
    title: 'testIncidentTitle',
    body: 'testBody',
    serviceId: 'testServiceId',
    incidentKey: 'testIncidentKey',
    from: 'null@foo.bar'
  };

  nock('https://api.pagerduty.com:443', { 'encodedQueryParams': true })
    .post('/incidents', {
      incident: {
        type: 'incident',
        title: 'testIncidentTitle',
        service: {
          id: 'testServiceId',
          type: 'service_reference'
        },
        incident_key: 'testIncidentKey',
        body: {
          type: 'incident_body',
          details: 'testBody'
        }
      }
    })
    .reply(201, fixtures.incidentWithBody);

  pagerduty.createIncident(options)
    .then(res => {
      assert.deepEqual(res.body, fixtures.incidentWithBody, '-- incident with body should be created');
      assert.end();
    })
    .catch(err => { console.log(err); });
});
