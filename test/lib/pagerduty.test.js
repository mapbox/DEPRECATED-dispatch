'use strict';

const pd = require('../../lib/pagerduty.js');
const tape = require('tape');
const nock = require('nock');
const incident = require('../fixtures/pagerduty.fixtures.js').incident;

tape('[pagerduty] Creates incident', function(assert) {
  let options = {
    accessToken: 'FakeApiToken',
    title: 'this is a test',
    serviceId: 'XXXXXXX',
    incidentKey: 'testing',
    from: 'null@foo.bar'
  }

  nock('https://api.pagerduty.com:443', {"encodedQueryParams":true})
    .post('/incidents', {"incident": {
      "type":"incident",
      "title":"this is a test",
      "service": {
        "id":"XXXXXXX",
        "type":"service_reference" },
      "incident_key":"testing" }
    })
    .reply(201, incident);

  pd.createIncident(options)
  .then(res => {
    assert.deepEqual(res.body, incident, 'Incident was created.');
    assert.end();
  })
  .catch(err => { console.log(err);})
})
