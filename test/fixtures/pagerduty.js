module.exports.incident = incident;

function incident() {
  let incident = {
    "incident": {
      "incident_number": 123512,
      "title": "this is a test",
      "description": "this is a test",
      "created_at": "2017-08-04T22:37:22Z",
      "status": "triggered",
      "pending_actions": [{
        "type": "escalate",
        "at": "2017-08-04T23:07:22Z"
      }],
      "incident_key": "testing",
      "service": {
        "id": "XXXXXXX",
        "type": "service_reference",
        "summary": "test",
        "self": "https://api.pagerduty.com/services/XXXXXXX",
        "html_url": "https://mapbox.pagerduty.com/services/XXXXXXX"
      },
      "assignments": [{
        "at": "2017-08-04T22:37:22Z",
        "assignee": {
          "id": "XXXXXXX",
          "type": "user_reference",
          "summary": "devnull",
          "self": "https://api.pagerduty.com/users/XXXXXXX",
          "html_url": "https://mapbox.pagerduty.com/users/XXXXXXX"
        }
      }],
      "acknowledgements": [],
      "last_status_change_at": "2017-08-04T22:37:22Z",
      "last_status_change_by": {
        "id": "XXXXXXX",
        "type": "service_reference",
        "summary": "test",
        "self": "https://api.pagerduty.com/services/XXXXXXX",
        "html_url": "https://mapbox.pagerduty.com/services/XXXXXXX"
      },
      "first_trigger_log_entry": {
        "id": "ASJDKLAKDLKLSDLKJDWKLANKLS",
        "type": "trigger_log_entry_reference",
        "summary": "Triggered through the website",
        "self": "https://api.pagerduty.com/log_entries/ASJDKLAKDLKLSDLKJDWKLANKLS",
        "html_url": "https://mapbox.pagerduty.com/incidents/XXXXXXX/log_entries/ASJDKLAKDLKLSDLKJDWKLANKLS"
      },
      "escalation_policy": {
        "id": "XXXXXXX",
        "type": "escalation_policy_reference",
        "summary": "test",
        "self": "https://api.pagerduty.com/escalation_policies/XXXXXXX",
        "html_url": "https://mapbox.pagerduty.com/escalation_policies/XXXXXXX"
      },
      "privilege": null,
      "teams": [],
      "alert_counts": {
        "all": 0,
        "triggered": 0,
        "resolved": 0
      },
      "impacted_services": [{
        "id": "XXXXXXX",
        "type": "service_reference",
        "summary": "test",
        "self": "https://api.pagerduty.com/services/XXXXXXX",
        "html_url": "https://mapbox.pagerduty.com/services/XXXXXXX"
      }],
      "is_mergeable": true,
      "basic_alert_grouping": null,
      "importance": null,
      "urgency": "high",
      "id": "XXXXXXX",
      "type": "incident",
      "summary": "[#63201] this is a test",
      "self": "https://api.pagerduty.com/incidents/XXXXXXX",
      "html_url": "https://mapbox.pagerduty.com/incidents/XXXXXXX"
    }
  }

  return incident;
}
