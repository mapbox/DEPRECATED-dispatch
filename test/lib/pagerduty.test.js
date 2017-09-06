'use strict';

const pd = require('../../lib/pagerduty.js');
const tape = require('tape');
const nock = require('nock');
const incident = require('../fixtures/pagerduty.fixtures.js').incident;

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
    .reply(201, incident);

  pd.createIncident(options)
    .then(res => {
      assert.deepEqual(res.body, incident, 'Incident was created.');
      assert.end();
    })
    .catch(err => { console.log(err); });
});

tape('[pagerduty] Creates a PD incident from high priority with body', function(assert) {

  nock('https://api.pagerduty.com:443', {'encodedQueryParams':true})
    .post('/incidents', {
      incident: {
        type: 'incident',
        title: 'testTitle',
        service: {
          id: 'testServiceId',
          type: 'service_reference'
        },
        body: {
          type: 'incident_body',
          details: 'testBody'
        },
        incident_key: 'testIncidentKey'
      }
    })
    .reply(201, {});

  let options = {
    accessToken: 'FakeApiToken',
    title: 'testTitle',
    body: 'testBody',
    serviceId: 'testServiceId',
    incidentKey: 'testIncidentKey',
    from: 'null@foo.bar'
  };

  pd.createIncident(options)
    .then(res => {
      assert.ok(nock.isDone(),'Incident with body was called once');
      assert.end();
    })
    .catch(err => { console.log(err); });
});
