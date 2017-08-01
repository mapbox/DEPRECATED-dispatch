const PagerDuty = require('@mapbox/pagerduty');

module.exports = (options) => {
  return new Promise ((resolve, reject) => {
  const pd = new PagerDuty();
  pd.post({
    access_token: options.accessToken,
        path: 'incidents',
        body: {
          "incident": {
            "type": "incident",
            "title": options.title,
            "service": {
              "id": options.serviceId,
              "type": "service_reference"
            },
            "incident_key": options.incidentKey
          }
        },
        headers: {
          From: options.from
        }
      }, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
  });
};
