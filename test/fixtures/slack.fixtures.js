'use strict';

module.exports.sns = {
  broadcast: {
    type: 'broadcast',
    users: ['testUser1', 'testUser2', 'testUser3'],
    body: {
      github: {
        title: 'testGithubTitle',
        body: 'testGithubBody'
      },
      slack: {
        message: 'testSlackMessage'
      }
    },
    url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
    username: 'testUser1'
  },
  malformed: {
    type: 'self_service',
    users: ['testUser'],
    body: {}
  },
  malformedError: 'ERR: sns message parsing error',
  nullSNSError: 'ERR: null sns message',
  nullUsername: {
    type: 'self_service',
    users: [],
    issue: 7,
    url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
    body: {
      github: {
        title: 'testGithubTitle',
        body: 'testGithubBody'
      },
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
    type: 'self_service',
    users: ['testUser'],
    issue: 7,
    url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
    body: {
      github: {
        title: 'testGithubTitle',
        body: 'testGithubBody'
      },
      slack: {
        message: 'testSlackMessage',
        actions: {
          yes: 'testYesAction',
          no: 'testNoAction'
        }
      }
    },
    username: 'testUser'
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
  messageBroadcast: {
    text: 'testSlackMessage',
    attachments: [
      {
        text: 'testSlackMessage https://api.github.com/repos/testOwner/testRepo/issues/7',
        fallback: 'You are unable to ack this alert via Slack, refer to the GitHub issue.',
        callback_id: 'dispatch_callback',
        attachment_type: 'default'
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
    issue: 7,
    user: '@testUser',
    message: 'testSlackMessage',
    alert: true,
    url: 'https://api.github.com/repos/testOwner/testRepo/issues/7'
  },
  statusBroadcast: [ [
    { issue: 7,
      message: 'testSlackMessage',
      alert: true,
      url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
      user: '@testUser1' },
    { issue: 7,
      message: 'testSlackMessage',
      alert: true,
      url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
      user: '@testUser2' },
    { issue: 7,
      message: 'testSlackMessage',
      alert: true,
      url: 'https://api.github.com/repos/testOwner/testRepo/issues/7',
      user: '@testUser3' }
  ] ],
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
  username: '@testUser',
  usernameBroadcast: '@testUser1'
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
