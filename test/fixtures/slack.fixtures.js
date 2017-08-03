'use strict';

module.exports.sns = {
  mfaDisabled: {
    "timestamp" : "2017-07-31T00:54:06.655Z",
    "title": "User kara has disabled 2FA on their Github account",
    "priority": "self_service",
    "username": "kara",
    "message": {
      "issue": "Two factor authentication has been disabled...",
      "directions": "Ensure you re-enable 2FA on your Github account...",
      "prompt": {
        "message": "Did you turn off two-factor authentication on your GitHub account? ...",
        "actions": [
          {
            "value": "Yes"
          },
          {
            "value": "No"
          }
        ]
      }
    }
  },
  madePublic: {
    "timestamp" : "2017-07-31T00:54:06.655Z",
    "title": "Prvate repository totally-not-sensitive-data made public by kara",
    "priority": "self_service",
    "username": "kara",
    "message": {
      "issue": "A private Mapbox repository has been made public...",
      "directions": "Please review the contents of this repository and...",
      "prompt": {
        "message": "Did you make this private repository public? ...",
        "actions": [
          {
            "value": "Yes"
          },
          {
            "value": "No"
          }
        ]
      }
    }
  }
};

module.exports.slack = {
  message: {
    text: 'Two factor authentication has been disabled...',
    attachments: [ {
      text: 'Did you turn off two-factor authentication on your GitHub account? ...',
      fallback: 'You are unable to ack this alert via Slack, refer to the GitHub issue.',
      callback_id: 'dispatch_callback',
      attachment_type: 'default',
      actions: [Object] } ]
  },
  postMessage: {
    ok: true,
    channel: 'D6G0UU7MW',
    ts: '1501777340.256863',
    message: {
      type: 'message',
      user: 'U6GHXJQ1Z',
      text: 'Two factor authentication has been disabled...',
      bot_id: 'B6G0UU6HW',
      attachments: [ [Object] ],
      ts: '1501777340.256863'
    },
    scopes: [ 'identify', 'bot:basic' ],
    acceptedScopes: [ 'chat:write:user', 'client' ]
  }
};