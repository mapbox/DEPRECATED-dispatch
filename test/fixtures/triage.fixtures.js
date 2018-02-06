'use strict';

module.exports.invalidJSON = {
  postBody: '[ this is an invalid JSON payload ]'
};

module.exports.badToken = {
  postBody: 'payload=%7B%22actions%22%3A%5B%7B%22name%22%3A%22yes%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22Yes%22%7D%5D%2C%22callback_id%22%3A%22eyJnaXRodWIiOiI3IiwicmVxdWVzdElkIjoiOGMzZDdjNmY1NTA0OTZkOTY4MjJkZTQzOTAwNjA4MDcifQ%22%2C%22team%22%3A%7B%22id%22%3A%22T6FD7RSPJ%22%2C%22domain%22%3A%22alarm-herder%22%7D%2C%22channel%22%3A%7B%22id%22%3A%22D6G0UU7MW%22%2C%22name%22%3A%22directmessage%22%7D%2C%22user%22%3A%7B%22id%22%3A%22U6G6XMXHB%22%2C%22name%22%3A%22kara%22%7D%2C%22action_ts%22%3A%221501726241.436435%22%2C%22message_ts%22%3A%221501726233.375111%22%2C%22attachment_id%22%3A%221%22%2C%22token%22%3A%22badToken%22%2C%22is_app_unfurl%22%3Afalse%2C%22original_message%22%3A%7B%22type%22%3A%22message%22%2C%22user%22%3A%22U6GHXJQ1Z%22%2C%22text%22%3A%22Two+factor+authentication+has+been+disabled...%22%2C%22bot_id%22%3A%22B6G0UU6HW%22%2C%22attachments%22%3A%5B%7B%22callback_id%22%3A%22dispatch_callback%22%2C%22fallback%22%3A%22You+are+unable+to+ack+this+alert+via+Slack%2C+refer+to+the+GitHub+issue.%22%2C%22text%22%3A%22Did+you+turn+off+two-factor+authentication+on+your+GitHub+account%3F+...%22%2C%22id%22%3A1%2C%22actions%22%3A%5B%7B%22id%22%3A%221%22%2C%22name%22%3A%22yes%22%2C%22text%22%3A%22Yes%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22Yes%22%2C%22style%22%3A%22%22%7D%2C%7B%22id%22%3A%222%22%2C%22name%22%3A%22no%22%2C%22text%22%3A%22No%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22No%22%2C%22style%22%3A%22danger%22%7D%5D%7D%5D%2C%22ts%22%3A%221501726233.375111%22%7D%2C%22response_url%22%3A%22https%3A%5C%2F%5C%2Fhooks.slack.com%5C%2Factions%5C%2FT6FD7RSPJ%5C%2F220826454016%5C%2Fo43iEPo76zlrFmA9TCa3sgrh%22%2C%22trigger_id%22%3A%22221406808019.219449876800.c18a27ebc48732af6bae2a76a18828d6%22%7D'
};

module.exports.extraAction = {
  postBody: 'payload=%7B%22actions%22%3A%5B%7B%22name%22%3A%22yes%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22Yes%22%7D%2C%7B%22name%22%3A%22no%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22No%22%7D%5D%2C%22callback_id%22%3A%22eyJnaXRodWIiOiI3IiwicmVxdWVzdElkIjoiOGMzZDdjNmY1NTA0OTZkOTY4MjJkZTQzOTAwNjA4MDcifQ%22%2C%22team%22%3A%7B%22id%22%3A%22T6FD7RSPJ%22%2C%22domain%22%3A%22alarm-herder%22%7D%2C%22channel%22%3A%7B%22id%22%3A%22D6G0UU7MW%22%2C%22name%22%3A%22directmessage%22%7D%2C%22user%22%3A%7B%22id%22%3A%22U6G6XMXHB%22%2C%22name%22%3A%22kara%22%7D%2C%22action_ts%22%3A%221501726241.436435%22%2C%22message_ts%22%3A%221501726233.375111%22%2C%22attachment_id%22%3A%221%22%2C%22token%22%3A%22testSlackVerificationToken%22%2C%22is_app_unfurl%22%3Afalse%2C%22original_message%22%3A%7B%22type%22%3A%22message%22%2C%22user%22%3A%22U6GHXJQ1Z%22%2C%22text%22%3A%22Two+factor+authentication+has+been+disabled...%22%2C%22bot_id%22%3A%22B6G0UU6HW%22%2C%22attachments%22%3A%5B%7B%22callback_id%22%3A%22dispatch_callback%22%2C%22fallback%22%3A%22You+are+unable+to+ack+this+alert+via+Slack%2C+refer+to+the+GitHub+issue.%22%2C%22text%22%3A%22Did+you+turn+off+two-factor+authentication+on+your+GitHub+account%3F+...%22%2C%22id%22%3A1%2C%22actions%22%3A%5B%7B%22id%22%3A%221%22%2C%22name%22%3A%22yes%22%2C%22text%22%3A%22Yes%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22Yes%22%2C%22style%22%3A%22%22%7D%2C%7B%22id%22%3A%222%22%2C%22name%22%3A%22no%22%2C%22text%22%3A%22No%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22No%22%2C%22style%22%3A%22danger%22%7D%5D%7D%5D%2C%22ts%22%3A%221501726233.375111%22%7D%2C%22response_url%22%3A%22https%3A%5C%2F%5C%2Fhooks.slack.com%5C%2Factions%5C%2FT6FD7RSPJ%5C%2F220826454016%5C%2Fo43iEPo76zlrFmA9TCa3sgrh%22%2C%22trigger_id%22%3A%22221406808019.219449876800.c18a27ebc48732af6bae2a76a18828d6%22%7D'
};

module.exports.ok = {
  postBody: 'payload=%7B%22actions%22%3A%5B%7B%22name%22%3A%22yes%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22Yes%22%7D%5D%2C%22callback_id%22%3A%22eyJnaXRodWIiOiI3IiwicmVxdWVzdElkIjoiOGMzZDdjNmY1NTA0OTZkOTY4MjJkZTQzOTAwNjA4MDcifQ%22%2C%22team%22%3A%7B%22id%22%3A%22T6FD7RSPJ%22%2C%22domain%22%3A%22alarm-herder%22%7D%2C%22channel%22%3A%7B%22id%22%3A%22D6G0UU7MW%22%2C%22name%22%3A%22directmessage%22%7D%2C%22user%22%3A%7B%22id%22%3A%22U6G6XMXHB%22%2C%22name%22%3A%22kara%22%7D%2C%22action_ts%22%3A%221501726241.436435%22%2C%22message_ts%22%3A%221501726233.375111%22%2C%22attachment_id%22%3A%221%22%2C%22token%22%3A%22testSlackVerificationToken%22%2C%22is_app_unfurl%22%3Afalse%2C%22original_message%22%3A%7B%22type%22%3A%22message%22%2C%22user%22%3A%22U6GHXJQ1Z%22%2C%22text%22%3A%22Two+factor+authentication+has+been+disabled...%22%2C%22bot_id%22%3A%22B6G0UU6HW%22%2C%22attachments%22%3A%5B%7B%22callback_id%22%3A%22dispatch_callback%22%2C%22fallback%22%3A%22You+are+unable+to+ack+this+alert+via+Slack%2C+refer+to+the+GitHub+issue.%22%2C%22text%22%3A%22Did+you+turn+off+two-factor+authentication+on+your+GitHub+account%3F+...%22%2C%22id%22%3A1%2C%22actions%22%3A%5B%7B%22id%22%3A%221%22%2C%22name%22%3A%22yes%22%2C%22text%22%3A%22Yes%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22Yes%22%2C%22style%22%3A%22%22%7D%2C%7B%22id%22%3A%222%22%2C%22name%22%3A%22no%22%2C%22text%22%3A%22No%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22No%22%2C%22style%22%3A%22danger%22%7D%5D%7D%5D%2C%22ts%22%3A%221501726233.375111%22%7D%2C%22response_url%22%3A%22https%3A%5C%2F%5C%2Fhooks.slack.com%5C%2Factions%5C%2FT6FD7RSPJ%5C%2F220826454016%5C%2Fo43iEPo76zlrFmA9TCa3sgrh%22%2C%22trigger_id%22%3A%22221406808019.219449876800.c18a27ebc48732af6bae2a76a18828d6%22%7D'
};

module.exports.notOk = {
  postBody: 'payload=%7B%22actions%22%3A%5B%7B%22name%22%3A%22no%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22No%22%7D%5D%2C%22callback_id%22%3A%22eyJnaXRodWIiOiI3IiwicmVxdWVzdElkIjoiNmNmOTM5N2M3MWUyIn0%22%2C%22team%22%3A%7B%22id%22%3A%22T6FD7RSPJ%22%2C%22domain%22%3A%22alarm-herder%22%7D%2C%22channel%22%3A%7B%22id%22%3A%22D6G0UU7MW%22%2C%22name%22%3A%22directmessage%22%7D%2C%22user%22%3A%7B%22id%22%3A%22U6G6XMXHB%22%2C%22name%22%3A%22kara%22%7D%2C%22action_ts%22%3A%221501726241.436435%22%2C%22message_ts%22%3A%221501726233.375111%22%2C%22attachment_id%22%3A%221%22%2C%22token%22%3A%22testSlackVerificationToken%22%2C%22is_app_unfurl%22%3Afalse%2C%22original_message%22%3A%7B%22type%22%3A%22message%22%2C%22user%22%3A%22U6GHXJQ1Z%22%2C%22text%22%3A%22Two+factor+authentication+has+been+disabled...%22%2C%22bot_id%22%3A%22B6G0UU6HW%22%2C%22attachments%22%3A%5B%7B%22callback_id%22%3A%22dispatch_callback%22%2C%22fallback%22%3A%22You+are+unable+to+ack+this+alert+via+Slack%2C+refer+to+the+GitHub+issue.%22%2C%22text%22%3A%22Did+you+turn+off+two-factor+authentication+on+your+GitHub+account%3F+...%22%2C%22id%22%3A1%2C%22actions%22%3A%5B%7B%22id%22%3A%221%22%2C%22name%22%3A%22yes%22%2C%22text%22%3A%22Yes%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22Yes%22%2C%22style%22%3A%22%22%7D%2C%7B%22id%22%3A%222%22%2C%22name%22%3A%22no%22%2C%22text%22%3A%22No%22%2C%22type%22%3A%22button%22%2C%22value%22%3A%22No%22%2C%22style%22%3A%22danger%22%7D%5D%7D%5D%2C%22ts%22%3A%221501726233.375111%22%7D%2C%22response_url%22%3A%22https%3A%5C%2F%5C%2Fhooks.slack.com%5C%2Factions%5C%2FT6FD7RSPJ%5C%2F220826454016%5C%2Fo43iEPo76zlrFmA9TCa3sgrh%22%2C%22trigger_id%22%3A%22221406808019.219449876800.c18a27ebc48732af6bae2a76a18828d6%22%7D'
};

module.exports.responses = {
  ok: {
    attachments: [
      {
        attachment_type: 'default',
        fallback: 'Could not load Slack response, 8c3d7c6f550496d96822de4390060807: closed GitHub issue testGitHubRepo/7',
        text: 'Yes',
        color: '#008E00',
        footer: 'Dispatch alert acknowledged',
        ts: 'testTimeStamp',
        replace_original: false
      }
    ]
  },
  okError: 'Error: dispatch 8c3d7c6f550496d96822de4390060807 failed to close GitHub issue testGitHubRepo/7, Bad request',
  notOk: {
    attachments: [
      {
        attachment_type: 'default',
        fallback: 'Could not load Slack response, 6cf9397c71e2: Created PagerDuty incident successfully',
        text: 'No',
        color: '#CC0000',
        footer: 'Dispatch alert escalated',
        ts: 'testTimeStamp',
        replace_original: false
      }
    ]
  },
  notOkError: 'Error: dispatch 6cf9397c71e2 failed to create PagerDuty incident'
};

module.exports.incident = {
  'incident': {
    'incident_number': 123512,
    'title': 'dispatch 6cf9397c71e2: user kara responded \'no\' for self-service issue testGitHubRepo/7',
    'body': 'dispatch 6cf9397c71e2: user kara responded \'no\' for self-service issue testGitHubRepo/7\n\n https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
    'description': 'dispatch 6cf9397c71e2: user kara responded \'no\' for self-service issue testGitHubRepo/7',
    'created_at': '2017-08-04T22:37:22Z',
    'status': 'triggered',
    'pending_actions': [{
      'type': 'escalate',
      'at': '2017-08-04T23:07:22Z'
    }],
    'incident_key': '6cf9397c71e2',
    'service': {
      'id': 'XXXXXXX',
      'type': 'service_reference',
      'summary': 'test',
      'self': 'https://api.pagerduty.com/services/XXXXXXX',
      'html_url': 'https://mapbox.pagerduty.com/services/XXXXXXX'
    },
    'assignments': [{
      'at': '2017-08-04T22:37:22Z',
      'assignee': {
        'id': 'XXXXXXX',
        'type': 'user_reference',
        'summary': 'devnull',
        'self': 'https://api.pagerduty.com/users/XXXXXXX',
        'html_url': 'https://mapbox.pagerduty.com/users/XXXXXXX'
      }
    }],
    'acknowledgements': [],
    'last_status_change_at': '2017-08-04T22:37:22Z',
    'last_status_change_by': {
      'id': 'XXXXXXX',
      'type': 'service_reference',
      'summary': 'test',
      'self': 'https://api.pagerduty.com/services/XXXXXXX',
      'html_url': 'https://mapbox.pagerduty.com/services/XXXXXXX'
    },
    'first_trigger_log_entry': {
      'id': 'ASJDKLAKDLKLSDLKJDWKLANKLS',
      'type': 'trigger_log_entry_reference',
      'summary': 'Triggered through the website',
      'self': 'https://api.pagerduty.com/log_entries/ASJDKLAKDLKLSDLKJDWKLANKLS',
      'html_url': 'https://mapbox.pagerduty.com/incidents/XXXXXXX/log_entries/ASJDKLAKDLKLSDLKJDWKLANKLS'
    },
    'escalation_policy': {
      'id': 'XXXXXXX',
      'type': 'escalation_policy_reference',
      'summary': 'test',
      'self': 'https://api.pagerduty.com/escalation_policies/XXXXXXX',
      'html_url': 'https://mapbox.pagerduty.com/escalation_policies/XXXXXXX'
    },
    'privilege': null,
    'teams': [],
    'alert_counts': {
      'all': 0,
      'triggered': 0,
      'resolved': 0
    },
    'impacted_services': [{
      'id': 'XXXXXXX',
      'type': 'service_reference',
      'summary': 'test',
      'self': 'https://api.pagerduty.com/services/XXXXXXX',
      'html_url': 'https://mapbox.pagerduty.com/services/XXXXXXX'
    }],
    'is_mergeable': true,
    'basic_alert_grouping': null,
    'importance': null,
    'urgency': 'high',
    'id': 'XXXXXXX',
    'type': 'incident',
    'summary': '[#63201] dispatch 6cf9397c71e2: user kara responded \'no\' for self-service issue testGitHubRepo/7',
    'self': 'https://api.pagerduty.com/incidents/XXXXXXX',
    'html_url': 'https://mapbox.pagerduty.com/incidents/XXXXXXX'
  }
};