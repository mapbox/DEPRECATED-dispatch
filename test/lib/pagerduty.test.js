'use strict';

const pd = require('../../lib/pagerduty.js');
const tape = require('tape');
const nock = require('nock');
const fixtures = require('../fixtures/pagerduty.fixtures.js');

/* eslint-disable no-unused-vars,camelcase */

tape('[pagerduty] Creates incident', function(assert) {
  let options = {
    accessToken: 'FakeApiToken',
    title: 'testTitle',
    serviceId: 'testServiceId',
    incidentKey: 'testIncidentKey',
    from: 'null@foo.bar'
  };

  nock('https://api.pagerduty.com:443', {'encodedQueryParams':true})
    .post('/incidents', {
      incident: {
        type:'incident',
        title:'testTitle',
        service: {
          id:'testServiceId',
          type:'service_reference'
        },
        incident_key:'testIncidentKey' }
    })
    .reply(201, fixtures.incident);

  pd.createIncident(options)
    .then(res => {
      assert.deepEqual(res.body, fixtures.incident, 'Incident was created.');
      assert.end();
    })
    .catch(err => { console.log(err); });
});

tape('[pagerduty] Creates a PD incident from high priority with body', function(assert) {
  let options = {
    accessToken: 'FakeApiToken',
    title: 'testTitle',
    body: 'testBody',
    serviceId: 'testServiceId',
    incidentKey: 'testIncidentKey',
    from: 'null@foo.bar'
  };

  nock('https://api.pagerduty.com:443', {'encodedQueryParams':true})
    .post('/incidents', {
      incident: {
        type: 'incident',
        title: 'testTitle',
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

  pd.createIncident(options)
    .then(res => {
      assert.deepEqual(res.body, fixtures.incidentWithBody, 'Incident with body was created.');
      assert.end();
    })
    .catch(err => { console.log(err); });
});
