'use strict';

module.exports.sns = {
  malformed: {
    timestamp: '2017-07-31T00:54:06.655Z',
    type: 'self_service',
    users: ['testUser'],
    body: {}
  },
  malformedError: 'ERR: sns message parsing error',
  nullSNSError: 'ERR: null sns message',
  nullUsername: {
    timestamp: '2017-07-31T00:54:06.655Z',
    type: 'self_service',
    users: [],
    issue: 7,
    url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
    body: {
      slack: {
        message: 'testSlackMessage',
        actions: {
          yes: 'testYesAction',
          no: 'testNoAction'
        }
      }
    }
  },
  success: {
    timestamp: '2017-07-31T00:54:06.655Z',
    type: 'self_service',
    users: ['testUser'],
    issue: '7',
    url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
    body: {
      slack: {
        message: 'testSlackMessage',
        actions: {
          yes: 'testYesAction',
          no: 'testNoAction'
        }
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
    text: 'testSlackMessage',
    attachments: [
      {
        text: 'testSlackMessage https://api.github.com/repos/testOwner/testRepo/issues/7',
        fallback: 'You are unable to ack this alert via Slack, refer to the GitHub issue.',
        callback_id: 'dispatch_callback',
        attachment_type: 'default',
        actions: [
          {
            name: 'yes',
            text: 'testYesAction',
            type: 'button',
            value: 1
          },
          {
            name: 'no',
            text: 'testNoAction',
            type: 'button',
            value: 0,
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
    user: '@testUser',
    id: 'U6GHXJQ1Z',
    bot: 'B6G0UU6HW',
    res: true,
    timestamp: '1501777340.256863',
    issue: '7',
    url: 'https://api.github.com/repos/testOwner/testRepo/issues/7'
  },
  statusFinal: {
    user: '@testUser',
    id: 'U6GHXJQ1Z',
    url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
    issue: 7,
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
  username: '@testUser'
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
