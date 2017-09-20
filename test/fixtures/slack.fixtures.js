'use strict';

module.exports.sns = {
  broadcast: {
    type: 'broadcast',
    users: ['@testUser1', '@testUser2', '@testUser3'],
    'callback_id': 'testCallbackId',
    number: 7,
    body: {
      github: {
        title: 'testGithubTitle',
        body: 'testGithubBody'
      },
      slack: {
        message: 'testSlackMessage'
      }
    },
    url: 'https://github.com/testOwner/testRepo/issues/7',
    requestId: 123
  },
  malformed: {
    type: 'self_service',
    users: ['@testUser'],
    body: {},
    requestId: 123
  },
  malformedError: '123 sns message parsing error: TypeError: Cannot read property \'slack\' of undefined',
  malformedMessageError: '123 sns message parsing error: TypeError: Cannot read property \'message\' of undefined',
  malformedNoIssueError: 'No GitHub issue number found in message body',
  success: {
    type: 'self_service',
    users: ['@testUser'],
    'callback_id': 'testCallbackId',
    number: 7,
    body: {
      github: {
        title: 'testGithubTitle',
        body: 'testGithubBody'
      },
      slack: {
        message: 'testSlackMessage',
        prompt: 'testSlackPrompt',
        actions: {
          yes: 'testYesAction',
          no: 'testNoAction'
        }
      }
    },
    url: 'https://github.com/testOwner/testRepo/issues/7',
    requestId: 123
  },
  successWithResponse: {
    type: 'self_service',
    users: ['@testUser'],
    'callback_id': 'testCallbackId',
    number: 7,
    body: {
      github: {
        title: 'testGithubTitle',
        body: 'testGithubBody'
      },
      slack: {
        message: 'testSlackMessage',
        prompt: 'testSlackPrompt',
        actions: {
          yes: 'testYesAction',
          'yes_response': 'yes response',
          no: 'testNoAction',
          'no_response': 'no response'
        }
      }
    },
    url: 'https://github.com/testOwner/testRepo/issues/7',
    requestId: 123
  },
  successNoPrompt: {
    type: 'self_service',
    users: ['@testUser'],
    'callback_id': 'testCallbackId',
    number: 7,
    body: {
      github: {
        title: 'testGithubTitle',
        body: 'testGithubBody'
      },
      slack: {
        message: 'testSlackMessage'
      }
    },
    url: 'https://github.com/testOwner/testRepo/issues/7',
    requestId: 123
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
        fallback: 'Could not load GitHub issue.',
        'callback_id': 'testCallbackId',
        'attachment_type': 'default',
        text: 'https://github.com/testOwner/testRepo/issues/7'
      }
    ]
  },
  prompt: {
    text: 'testSlackPrompt',
    attachments: [
      {
        fallback: 'You are unable to address this alert via Slack, refer to the GitHub issue.',
        'callback_id': 'testCallbackId',
        'attachment_type': 'default',
        actions: [
          {
            name: 'yes',
            text: 'testYesAction',
            type: 'button',
            value: false
          },
          {
            name: 'no',
            text: 'testNoAction',
            type: 'button',
            value: false,
            style: 'danger'
          }
        ]
      }
    ]
  },
  promptWithResponseText: {
    text: 'testSlackPrompt',
    attachments: [
      {
        fallback: 'You are unable to address this alert via Slack, refer to the GitHub issue.',
        'callback_id': 'testCallbackId',
        'attachment_type': 'default',
        actions: [
          {
            name: 'yes',
            text: 'testYesAction',
            type: 'button',
            value: 'yes response'
          },
          {
            name: 'no',
            text: 'testNoAction',
            type: 'button',
            value: 'no response',
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
        fallback: 'Could not load GitHub issue.',
        'callback_id': 'testCallbackId',
        'attachment_type': 'default'
      }
    ]
  },
  missingMessageError: '123 missing Slack message body',
  noChannel: {
    ok: false,
    error: 'channel_not_found',
    scopes: [ 'identify', 'bot:basic' ],
    acceptedScopes: [ 'chat:write:bot', 'post' ]
  },
  status: {
    alert: true,
    destination: '@testUser',
    message: 'testSlackMessage',
    url: 'https://github.com/testOwner/testRepo/issues/7'
  },
  statusPrompt: {
    alert: true,
    destination: '@testUser',
    message: 'testSlackMessage, Prompt: testSlackPrompt',
    url: 'https://github.com/testOwner/testRepo/issues/7'
  },
  statusBroadcast: [
    {
      alert: true,
      destination: '@testUser1',
      message: 'testSlackMessage',
      url: 'https://github.com/testOwner/testRepo/issues/7'
    },
    {
      alert: true,
      destination: '@testUser2',
      message: 'testSlackMessage',
      url: 'https://github.com/testOwner/testRepo/issues/7'
    },
    {
      alert: true,
      destination: '@testUser3',
      message: 'testSlackMessage',
      url: 'https://github.com/testOwner/testRepo/issues/7'
    }
  ],
  success: {
    ok: true,
    channel: 'D6G0UU7MW',
    ts: '1501777340.256863',
    message:
     { type: 'message',
       user: 'U6GHXJQ1Z',
       text: 'testSlackMessage',
       'bot_id': 'B6G0UU6HW',
       attachments: [ [Object] ],
       ts: '1501777340.256863' },
    scopes: [ 'identify', 'bot:basic' ],
    acceptedScopes: [ 'chat:write:user', 'client' ]
  },
  successPrompt: {
    ok: true,
    channel: 'D6G0UU7MW',
    ts: '1501777340.256863',
    message:
     { type: 'message',
       user: 'U6GHXJQ1Z',
       text: 'testSlackPrompt',
       'bot_id': 'B6G0UU6HW',
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
    slackAPIUrl:'test-url',
    requestId: 123
  },
  error: {
    _token:'test-token',
    slackAPIUrl:'test-url',
    chat: {
      postMessage: function(username, message, options, callback) {
        if (username == '@testUser') {
          return callback('error', {
            ok: false,
            error: 'no_text',
            scopes: [ 'identify', 'bot:basic' ],
            acceptedScopes: [ 'chat:write:user', 'client' ]
          });
        } else {
          return callback(null, {
            ok: true,
            channel: 'D6G0UU7MW',
            ts: '1501777340.256863',
            message: {
              type: 'message',
              user: 'U6GHXJQ1Z',
              text: 'testSlackMessage',
              'bot_id': 'B6G0UU6HW',
              attachments: [ [Object] ],
              ts: '1501777340.256863'
            },
            scopes: [ 'identify', 'bot:basic' ],
            acceptedScopes: [ 'chat:write:user', 'client' ]
          });
        }
      }
    }
  },
  everythingErrors: {
    _token:'test-token',
    slackAPIUrl:'test-url',
    chat: {
      postMessage: function(username, message, options, callback) {
        if (username == '@testUser') {
          return callback('error', {
            ok: false,
            error: 'no_text',
            scopes: [ 'identify', 'bot:basic' ],
            acceptedScopes: [ 'chat:write:user', 'client' ]
          });
        } else {
          return callback('error', {
            ok: false,
            error: 'channel_not_found',
            scopes: [ 'identify', 'bot:basic' ],
            acceptedScopes: [ 'chat:write:bot', 'post' ]
          });
        }
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
            text: 'testSlackMessage',
            'bot_id': 'B6G0UU6HW',
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
