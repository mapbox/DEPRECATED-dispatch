'use strict';

const webClient = require('@slack/client').WebClient;
const _ = require('lodash');

module.exports.alertToSlack = alertToSlack;
function alertToSlack(snsMessage, client, channel, callback) {
  ingestSNS(snsMessage, channel, (err, username, message) => {
    if (err) return callback(err);
    postAlert(username, message, client, (err, res) => {
      if (err) return callback(err);
      const status = {
        user: username,
        id: res.message.user,
        bot: res.message.bot_id,
        res: res.ok,
        timestamp: res.message.ts,
        issue: snsMessage.issue
      };
      console.log(`USER: ${status.user}, ID: ${status.id}, BOT: ${status.bot}, RES: ${status.res}, TS: ${status.timestamp}, ISSUE: ${status.issue}`);
      return callback(null, status);
    });
  });
}

module.exports.ingestSNS = ingestSNS;
function ingestSNS(snsMessage, channel, callback) {
  let username;
  if (!snsMessage) return callback('ERR: null sns message');
  if (snsMessage.username) username = `@${snsMessage.username}`;
  if (!snsMessage.username) username = `#${channel}`;
  try {
    // handle no action options in SNS message for alerts
    const message = {
      'text': snsMessage.body.issue,
      'attachments': [
        {
          'text': snsMessage.body.prompt.message,
          'fallback': 'You are unable to ack this alert via Slack, refer to the GitHub issue.',
          'callback_id': 'dispatch_callback',
          'attachment_type': 'default',
          'actions': [
            {
              'name': 'yes',
              'text': snsMessage.body.prompt.actions[0].value,
              'type': 'button',
              'value': snsMessage.body.prompt.actions[0].value
            },
            {
              'name': 'no',
              'text': snsMessage.body.prompt.actions[1].value,
              'type': 'button',
              'value': snsMessage.body.prompt.actions[1].value,
              'style': 'danger'
            }
          ]
        }
      ]
    };

    return callback(null, username, message);
  } catch (err) {
    return callback('ERR: sns message parsing error');
  }
}

module.exports.postAlert = postAlert;
function postAlert(username, message, client, callback) {
  let options;
  if (!_.has(message, 'text')) return callback('ERR: missing message body');
  if (username.indexOf('@') > -1) options = { as_user: true, attachments: message.attachments };
  if (username.indexOf('#') > -1) options = { attachments: message.attachments };
  client.chat.postMessage(username, message.text, options, function(err, res) {
    if (err) return callback(res);
    return callback(null, res);
  });
}
