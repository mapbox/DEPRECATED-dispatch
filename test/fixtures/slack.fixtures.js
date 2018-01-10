'use strict';

module.exports.sns = {
  broadcast: {
    type: 'broadcast',
    users: ['@testSlackUser1', '@testSlackUser2', '@testSlackUser3'],
    callback_id: 'testCallbackId',
    body: {
      github: {
        title: 'testGitHubTitle',
        body: 'testGitHubBody'
      },
      slack: {
        message: 'testSlackMessage'
      }
    },
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
    number: 7,
    requestId: 'testRequestId'
  },
  encode: {
    type: 'self-service',
    users: ['@testSlackUser'],
    body: {
      github: {
        title: 'testGitHubTitle',
        body: 'testGitHubBody'
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
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
    requestId: 'testRequestId'
  },
  encodeError: 'Error - dispatch testRequestId message body missing GitHub issue number',
  malformed: {
    type: 'self-service',
    users: ['@testSlackUser'],
    body: {},
    number: 7,
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
    requestId: 'testRequestId'
  },
  malformedStatus: 'dispatch testRequestId - SNS message parsing error',
  requestId: 'testRequestId',
  success: {
    type: 'self-service',
    users: ['@testSlackUser'],
    callback_id: 'testCallbackId',
    body: {
      github: {
        title: 'testGitHubTitle',
        body: 'testGitHubBody'
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
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
    number: 7,
    requestId: 'testRequestId'
  },
  successWithResponse: {
    type: 'self-service',
    users: ['@testSlackUser'],
    callback_id: 'testCallbackId',
    body: {
      github: {
        title: 'testGitHubTitle',
        body: 'testGitHubBody'
      },
      slack: {
        message: 'testSlackMessage',
        prompt: 'testSlackPrompt',
        actions: {
          yes: 'testYesAction',
          yes_response: 'yes response',
          no: 'testNoAction',
          no_response: 'no response'
        }
      }
    },
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
    number: 7,
    requestId: 'testRequestId'
  },
  successNoPrompt: {
    type: 'self-service',
    users: ['@testSlackUser'],
    'callback_id': 'testCallbackId',
    number: 7,
    body: {
      github: {
        title: 'testGitHubTitle',
        body: 'testGitHubBody'
      },
      slack: {
        message: 'testSlackMessage'
      }
    },
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
    requestId: 123
  }
};

module.exports.slack = {
  channel: '#testSlackDefaultChannel',
  channelId: 'D6G0UU7MW',
  errorCustomMessage: 'slackAlertRoutingError',
  errorAlertToSlack: 'Error - dispatch testRequestId failed to send message to @testSlackUser, see Slack and Lambda logs for details',
  errorNoChannel: {
    ok: false,
    error: 'channel_not_found',
    scopes: [ 'identify', 'bot:basic' ],
    acceptedScopes: [ 'chat:write:bot', 'post' ]
  },
  message: {
    text: 'testSlackMessage',
    attachments: [
      {
        fallback: 'Could not load GitHub issue.',
        callback_id: 'testCallbackId',
        attachment_type: 'default',
        text: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
      }
    ]
  },
  messageBroadcast: {
    text: 'testSlackMessage',
    attachments: [
      {
        fallback: 'Could not load GitHub issue.',
        callback_id: 'testCallbackId',
        attachment_type: 'default'
      }
    ]
  },
  missingMessage: {
    requestId: 'testRequestId'
  },
  missingMessageError: 'Error - dispatch testRequestId missing Slack message body',
  prompt: {
    text: 'testSlackPrompt',
    attachments: [
      {
        fallback: 'You are unable to address this alert via Slack, refer to the GitHub issue.',
        callback_id: 'testCallbackId',
        attachment_type: 'default',
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
        callback_id: 'testCallbackId',
        attachment_type: 'default',
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
  status: {
    alert: true,
    destination: '@testSlackUser',
    message: 'testSlackMessage',
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
  },
  statusBroadcast: [
    {
      alert: true,
      destination: '@testSlackUser1',
      message: 'testSlackMessage',
      url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
    },
    {
      alert: true,
      destination: '@testSlackUser2',
      message: 'testSlackMessage',
      url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
    },
    {
      alert: true,
      destination: '@testSlackUser3',
      message: 'testSlackMessage',
      url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
    }
  ],
  statusIncomingSelfService: {
    alert: true,
    destination: '@testSlackUser',
    message: 'testSlackMessage',
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
  },
  statusPrompt: {
    alert: true,
    destination: '@testSlackUser',
    message: 'testSlackMessage, Prompt: testSlackPrompt',
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
  },
  success: {
    ok: true,
    channel: 'D6G0UU7MW',
    ts: '1501777340.256863',
    message:
     { type: 'message',
       user: 'U6GHXJQ1Z',
       text: 'testSlackMessage',
       bot_id: 'B6G0UU6HW',
       attachments: [ [Object] ],
       ts: '1501777340.256863' },
    scopes: [ 'identify', 'bot:basic' ],
    acceptedScopes: [ 'chat:write:user', 'client' ]
  },
  successFallback: {
    ok: true,
    channel: 'D6G0UU7MW',
    ts: '1501777340.256863',
    message: {
      type: 'message',
      user: 'U6GHXJQ1Z',
      text: 'testSlackMessage',
      bot_id: 'B6G0UU6HW',
      attachments: [ [Object] ],
      ts: '1501777340.256863'
    },
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
       bot_id: 'B6G0UU6HW',
       attachments: [ [Object] ],
       ts: '1501777340.256863' },
    scopes: [ 'identify', 'bot:basic' ],
    acceptedScopes: [ 'chat:write:user', 'client' ]
  },
  username: '@testSlackUser',
  usernameBroadcast: '@testSlackUser1'
};

module.exports.clients = {
  empty: {
    _token:'testSlackBotToken',
    slackAPIUrl:'testSlackApiUrl',
    requestId: 'testRequestId'
  },
  errorUser: {
    _token:'testSlackBotToken',
    slackAPIUrl:'testSlackApiUrl',
    chat: {
      postMessage: function(username, message, options, callback) {
        if (username == '@testSlackUser') {
          return callback('error', {
            ok: false,
            error: 'channel_not_found',
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
  },
  errorChannel: {
    _token:'testSlackBotToken',
    slackAPIUrl:'testSlackApiUrl',
    chat: {
      postMessage: function(username, message, options, callback) {
        if (username == '@testSlackUser') {
          return callback('error', {
            ok: false,
            error: 'channel_not_found',
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
  success: {
    _token:'testSlackBotToken',
    slackAPIUrl:'testSlackApiUrl',
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