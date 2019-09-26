'use strict';

const PagerDuty = require('@mapbox/pagerduty');

/**
 * Create a new PagerDuty incident
 *
 * @param {object} options - contains accessToken, title, serviceId, incidentKey, and from address
 */
const createIncident = (options) => {
  return new Promise ((resolve, reject) => {
    const pd = new PagerDuty({pagerDutyToken: options.accessToken});

    let config = {
      path: 'incidents',
      body: {
        incident: {
          type: 'incident',
          title: options.title,
          service: {
            id: options.serviceId,
            type: 'service_reference'
          },
          incident_key: options.incidentKey
        }
      },
      headers: {
        From: options.from
      }
    };

    if (options.body) {
      config.body.incident.body = {
        type: 'incident_body',
        details: options.body
      };
    }

    pd.post(config, (err, res) => {
      if (err) reject(err);
      resolve(res);
    });
  });
};

module.exports.createIncident = createIncident;
