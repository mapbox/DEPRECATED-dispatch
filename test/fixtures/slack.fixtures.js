'use strict';

module.exports.sns = {
  malformed: {
    'timestamp' : '2017-07-31T00:54:06.655Z',
    'title': 'User kara has disabled 2FA on their Github account',
    'priority': 'self_service',
    'username': 'kara',
    'body': {
      'issue': 'Two factor authentication has been disabled...',
      'directions': 'Ensure you re-enable 2FA on your Github account...'
    }
  },
  malformedError: 'ERR: sns message parsing error',
  nullSNSError: 'ERR: null sns message',
  nullUsername: {
    'timestamp' : '2017-07-31T00:54:06.655Z',
    'title': 'User kara has disabled 2FA on their Github account',
    'priority': 'self_service',
    'username': null,
    'body': {
      'issue': 'Two factor authentication has been disabled...',
      'directions': 'Ensure you re-enable 2FA on your Github account...',
      'prompt': {
        'message': 'Did you turn off two-factor authentication on your GitHub account? ...',
        'actions': [
          {
            'value': 'Yes'
          },
          {
            'value': 'No'
          }
        ]
      }
    }
  },
  success: {
    'timestamp' : '2017-07-31T00:54:06.655Z',
    'title': 'User kara has disabled 2FA on their Github account',
    'priority': 'self_service',
    'username': 'kara',
    'body': {
      'issue': 'Two factor authentication has been disabled...',
      'directions': 'Ensure you re-enable 2FA on your Github account...',
      'prompt': {
        'message': 'Did you turn off two-factor authentication on your GitHub account? ...',
        'actions': [
          {
            'value': 'Yes'
          },
          {
            'value': 'No'
          }
        ]
      }
    }
  }
};

module.exports.slack = {
  channel: '#test-channel',
  error: {
    ok: false,
    error: 'no_text',
    scopes: [ 'identify', 'bot:basic' ],
    acceptedScopes: [ 'chat:write:user', 'client' ]
  },
  message: {
    text: 'Two factor authentication has been disabled...',
    attachments: [
      {
        text: 'Did you turn off two-factor authentication on your GitHub account? ...',
        fallback: 'You are unable to ack this alert via Slack, refer to the GitHub issue.',
        callback_id: 'dispatch_callback',
        attachment_type: 'default',
        actions: [
          {
            name: 'yes',
            text: 'Yes',
            type: 'button',
            value: 'Yes'
          },
          {
            name: 'no',
            text: 'No',
            type: 'button',
            value: 'No',
            style: 'danger'
          }
        ]
      }
    ]
  },
  missingMessageError: 'ERR: missing message body',
  noChannel: {
    ok: false,
    error: 'channel_not_found',
    scopes: [ 'identify', 'bot:basic' ],
    acceptedScopes: [ 'chat:write:bot', 'post' ]
  },
  status: {
    user: '@kara',
    id: 'U6GHXJQ1Z',
    bot: 'B6G0UU6HW',
    res: true,
    timestamp: '1501777340.256863'
  },
  success: {
    ok: true,
    channel: 'D6G0UU7MW',
    ts: '1501777340.256863',
    message:
     { type: 'message',
       user: 'U6GHXJQ1Z',
       text: 'Two factor authentication has been disabled...',
       bot_id: 'B6G0UU6HW',
       attachments: [ [Object] ],
       ts: '1501777340.256863' },
    scopes: [ 'identify', 'bot:basic' ],
    acceptedScopes: [ 'chat:write:user', 'client' ]
  },
  username: '@kara'
};

module.exports.clients = {
  empty: {
    _token:'test-token',
    slackAPIUrl:'test-url'
  },
  error: {
    _token:'test-token',
    slackAPIUrl:'test-url',
    chat: {
      postMessage: function(username, message, options, callback) {
        return callback('error', {
          ok: false,
          error: 'no_text',
          scopes: [ 'identify', 'bot:basic' ],
          acceptedScopes: [ 'chat:write:user', 'client' ]
        });
      }
    }
  },
  noChannel: {
    _token:'test-token',
    slackAPIUrl:'test-url',
    chat: {
      postMessage: function(username, message, options, callback) {
        return callback('error', {
          ok: false,
          error: 'channel_not_found',
          scopes: [ 'identify', 'bot:basic' ],
          acceptedScopes: [ 'chat:write:bot', 'post' ]
        });
      }
    }
  },
  success: {
    _token:'test-token',
    slackAPIUrl:'test-url',
    chat: {
      postMessage: function(username, message, options, callback) {
        return callback(null, {
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
        });
      }
    }
  }
};