'use strict';

module.exports.sns = {
  broadcast: {
    type: 'broadcast',
    users: [
      {
        slack: 'testSlackUser1',
        slackId: 'testSlackId1'
      },
      {
        slack: 'testSlackUser2',
        slackId: 'testSlackId2'
      },
      {
        slack: 'testSlackUser3',
        slackId: 'testSlackId3'
      }
    ],
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
    users: [
      {
        slack: 'testSlackUser',
        slackId: 'testSlackId'
      }
    ],
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
    users: [
      {
        slack: 'testSlackUser',
        slackId: 'testSlackId'
      }
    ],
    body: {},
    number: 7,
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7',
    requestId: 'testRequestId'
  },
  malformedStatus: 'dispatch testRequestId - SNS message parsing error',
  requestId: 'testRequestId',
  success: {
    type: 'self-service',
    users: [
      {
        slack: 'testSlackUser',
        slackId: 'testSlackId'
      }
    ],
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
    users: [
      {
        slack: 'testSlackUser',
        slackId: 'testSlackId'
      }
    ],
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
    users: [
      {
        slack: 'testSlackUser',
        slackId: 'testSlackId'
      }
    ],
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
  missingMessageError: 'missing Slack message body',
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
    destination: 'testSlackId',
    message: 'testSlackMessage',
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
  },
  statusBroadcast: [
    {
      alert: true,
      destination: 'testSlackId1',
      message: 'testSlackMessage',
      url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
    },
    {
      alert: true,
      destination: 'testSlackId2',
      message: 'testSlackMessage',
      url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
    },
    {
      alert: true,
      destination: 'testSlackId3',
      message: 'testSlackMessage',
      url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
    }
  ],
  statusIncomingSelfService: {
    alert: true,
    destination: 'testSlackId',
    message: 'testSlackMessage',
    url: 'https://github.com/testGitHubOwner/testGitHubRepo/issues/7'
  },
  statusPrompt: {
    alert: true,
    destination: 'testSlackId',
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
  slackId: 'testSlackId'
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
      postMessage: function(destination, message, options, callback) {
        if (destination == 'testSlackId') {
          return callback('channel_not_found', {
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
      postMessage: function(destination, message, options, callback) {
        if (destination == 'testSlackId') {
          return callback('channel_not_found', {
            ok: false,
            error: 'channel_not_found',
            scopes: [ 'identify', 'bot:basic' ],
            acceptedScopes: [ 'chat:write:user', 'client' ]
          });
        } else {
          return callback('channel_not_found', {
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
      postMessage: function(destination, message, options, callback) {
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