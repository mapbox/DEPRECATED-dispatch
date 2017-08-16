'use strict';

const pd = require('../../lib/pagerduty.js');
const tape = require('tape');
const nock = require('nock');
const incident = require('../fixtures/pagerduty.fixtures.js').incident;

tape('[pagerduty] Creates incident', function(assert) {
  let options = {
    accessToken: 'FakeApiToken',
    title: 'testTitle',
    serviceId: 'testServiceId',
    incidentKey: 'testIncidentKey',
    from: 'null@foo.bar'
  };

  nock('https://api.pagerduty.com:443', {'encodedQueryParams':true})
    .post('/incidents', {incident: {
      type:'incident',
      title:'testTitle',
      service: {
        id:'testServiceId',
        type:'service_reference' },
      incident_key:'testIncidentKey' }
    })
    .reply(201, incident);

  pd.createIncident(options)
  .then(res => {
    assert.deepEqual(res.body, incident, 'Incident was created.');
    assert.end();
  })
    .catch(err => { console.log(err);});
});
